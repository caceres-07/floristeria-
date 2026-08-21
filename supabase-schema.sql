-- ============================================================
-- ZOLER — Esquema de base de datos (Supabase / PostgreSQL)
-- Cópialo COMPLETO y pégalo en: Supabase → SQL Editor → New query → Run
-- Es seguro ejecutarlo varias veces.
-- ============================================================

-- ---------- TABLAS ----------
create table if not exists products (
  id           text primary key,
  name         text not null,
  price        integer not null default 0,
  old_price    integer,
  category     text,
  color        text,
  flor         text,
  cantidad     integer default 12,
  size         text,
  occasions    text[] default '{}',
  tags         text[] default '{}',
  rating       numeric default 5,
  reviews_count integer default 0,
  stock        integer default 0,
  featured     boolean default false,
  best         boolean default false,
  is_new       boolean default false,
  hue          text default '#C97D84',
  img          text,
  description  text,
  long_desc    text,
  care         text[] default '{}',
  duration     text,
  created_at   timestamptz default now()
);

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  order_num      text unique not null,
  customer_name  text not null,
  phone          text not null,
  email          text not null,
  address        text,
  city           text,
  neighborhood   text,
  deliv_date     date,
  deliv_time     text,
  receiver       text,
  notes          text,
  card_message   text,
  payment_method text,
  payment_status text default 'Pendiente de pago',
  status         text default 'Pendiente',
  items          jsonb not null default '[]',
  subtotal       integer default 0,
  discount       integer default 0,
  shipping       integer default 0,
  total          integer default 0,
  coupon         text,
  wompi_ref      text,
  created_at     timestamptz default now()
);

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text references products(id) on delete cascade,
  author      text not null,
  rating      integer not null check (rating between 1 and 5),
  text        text,
  created_at  timestamptz default now()
);

-- ---------- SEGURIDAD (Row Level Security) ----------
alter table products enable row level security;
alter table orders   enable row level security;
alter table reviews  enable row level security;

-- PRODUCTOS: todos leen; solo admin escribe
drop policy if exists prod_read on products;
create policy prod_read on products for select using (true);
drop policy if exists prod_write on products;
create policy prod_write on products for all to authenticated using (true) with check (true);

-- RESEÑAS: todos leen; cualquiera crea; solo admin borra
drop policy if exists rev_read on reviews;
create policy rev_read on reviews for select using (true);
drop policy if exists rev_insert on reviews;
create policy rev_insert on reviews for insert with check (true);
drop policy if exists rev_admin on reviews;
create policy rev_admin on reviews for delete to authenticated using (true);

-- PEDIDOS: solo el admin puede leer/editar
drop policy if exists ord_admin on orders;
create policy ord_admin on orders for all to authenticated using (true) with check (true);

-- ---------- CUPONES ----------
-- Tabla para validar cupones en el servidor (no solo en el frontend)
create table if not exists coupons (
  code    text primary key,
  type    text not null check (type in ('pct','ship','fixed')),
  val     integer not null default 0,
  label   text,
  active  boolean default true,
  max_uses integer,
  used    integer default 0
);
alter table coupons enable row level security;
drop policy if exists coupon_read on coupons;
create policy coupon_read on coupons for select using (true);
drop policy if exists coupon_admin on coupons;
create policy coupon_admin on coupons for all to authenticated using (true) with check (true);

-- Insertar cupones existentes (ignorar si ya existen)
insert into coupons (code, type, val, label) values
  ('FLOR10', 'pct', 10, '10% de descuento'),
  ('BIENVENIDA', 'pct', 15, '15% de bienvenida'),
  ('ENVIOGRATIS', 'ship', 0, 'Envio gratis')
on conflict (code) do nothing;


-- ---------- FUNCIÓN: crear pedido + descontar inventario (atómico) ----------
-- SEGURA: recalcula el total desde los precios reales en la BD.
-- Valida stock antes de descontar. Valida cupón en el servidor.
create or replace function place_order(payload jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_num text;
  attempts int := 0;
  item jsonb;
  p_row products%rowtype;
  calc_subtotal integer := 0;
  calc_discount integer := 0;
  calc_shipping integer := 0;
  calc_total integer := 0;
  coupon_code text;
  coupon_row record;
  shipping_cost integer := 12000;
  free_from integer := 250000;
begin
  -- 1. Validar que hay items
  if jsonb_array_length(coalesce(payload->'items', '[]'::jsonb)) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  -- 2. Validar stock y calcular subtotal real desde precios de la BD
  for item in select * from jsonb_array_elements(payload->'items')
  loop
    select * into p_row from products where id = item->>'id';
    if p_row.id is null then
      raise exception 'Producto % no encontrado', item->>'id';
    end if;
    if p_row.stock < coalesce((item->>'qty')::int, 1) then
      raise exception 'Stock insuficiente para %: disponible %, solicitado %',
        p_row.name, p_row.stock, (item->>'qty')::int;
    end if;
    calc_subtotal := calc_subtotal + (p_row.price * coalesce((item->>'qty')::int, 1));
  end loop;

  -- 3. Validar y aplicar cupón (desde la tabla coupons, no desde el frontend)
  coupon_code := upper(trim(coalesce(payload->>'coupon', '')));
  if coupon_code <> '' then
    select * into coupon_row from coupons
      where code = coupon_code and active = true;
    if coupon_row.code is not null then
      if coupon_row.type = 'pct' then
        calc_discount := round(calc_subtotal * coupon_row.val / 100.0)::int;
      elsif coupon_row.type = 'fixed' then
        calc_discount := least(coupon_row.val, calc_subtotal);
      elsif coupon_row.type = 'ship' then
        -- El descuento de envío se aplica más abajo
        null;
      end if;
      -- Incrementar contador de usos
      update coupons set used = used + 1 where code = coupon_code;
    else
      coupon_code := null; -- Cupón inválido, ignorar
    end if;
  else
    coupon_code := null;
  end if;

  -- 4. Calcular envío
  if calc_subtotal >= free_from then
    calc_shipping := 0;
  elsif coupon_code is not null and coupon_row.type = 'ship' then
    calc_shipping := 0;
  else
    calc_shipping := shipping_cost;
  end if;

  -- 5. Calcular total final
  calc_total := calc_subtotal - calc_discount + calc_shipping;
  if calc_total < 0 then calc_total := 0; end if;

  -- 6. Generar número de pedido único
  loop
    new_num := 'ZL-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random()*10000))::text, 4, '0');
    exit when not exists(select 1 from orders where order_num = new_num);
    attempts := attempts + 1;
    exit when attempts >= 10;
  end loop;

  -- 7. Insertar pedido con totales calculados por el servidor
  insert into orders(order_num, customer_name, phone, email, address, city, neighborhood,
    deliv_date, deliv_time, receiver, notes, card_message, payment_method, payment_status,
    items, subtotal, discount, shipping, total, coupon)
  values(
    new_num,
    payload->>'name', payload->>'phone', payload->>'email', payload->>'address',
    payload->>'city', payload->>'neighborhood',
    nullif(payload->>'deliv_date', '')::date, payload->>'deliv_time',
    payload->>'receiver', payload->>'notes', payload->>'card_message',
    payload->>'payment_method', coalesce(payload->>'payment_status', 'Pendiente de pago'),
    coalesce(payload->'items', '[]'::jsonb),
    calc_subtotal, calc_discount, calc_shipping, calc_total,
    coupon_code
  );

  -- 8. Descontar stock (ya validamos que hay suficiente)
  for item in select * from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
  loop
    update products
      set stock = stock - coalesce((item->>'qty')::int, 1)
      where id = item->>'id';
  end loop;

  return new_num;
end;
$$;

grant execute on function place_order(jsonb) to anon, authenticated;

-- ---------- TABLA: suscriptores al newsletter ----------
create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz default now()
);
alter table subscribers enable row level security;
drop policy if exists sub_insert on subscribers;
create policy sub_insert on subscribers for insert with check (true);
drop policy if exists sub_admin on subscribers;
create policy sub_admin on subscribers for select to authenticated using (true);
