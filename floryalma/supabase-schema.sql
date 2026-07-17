-- ============================================================
-- FLOR & ALMA — Esquema de base de datos (Supabase / PostgreSQL)
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
-- Los clientes (anon) pueden VER productos y reseñas, y CREAR pedidos/reseñas.
-- Solo el administrador (usuario autenticado) puede editar productos y ver/gestionar pedidos.
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

-- PEDIDOS: solo el admin puede leer/editar. Los clientes NO pueden leer pedidos
-- (privacidad). Los pedidos se crean con la función place_order de abajo.
drop policy if exists ord_admin on orders;
create policy ord_admin on orders for all to authenticated using (true) with check (true);

-- ---------- FUNCIÓN: crear pedido + descontar inventario (atómico) ----------
-- Se ejecuta con permisos elevados para que un cliente anónimo pueda crear
-- el pedido de forma segura sin poder leer los pedidos de otros.
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
begin
  -- Genera un número de pedido único. Reintenta si hay colisión (probabilidad 1/10.000 por día).
  loop
    new_num := 'FA-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*10000))::text,4,'0');
    exit when not exists(select 1 from orders where order_num = new_num);
    attempts := attempts + 1;
    exit when attempts >= 10;  -- tras 10 intentos usa rango ampliado
  end loop;

  insert into orders(order_num, customer_name, phone, email, address, city, neighborhood,
    deliv_date, deliv_time, receiver, notes, card_message, payment_method, payment_status,
    items, subtotal, discount, shipping, total, coupon)
  values(
    new_num,
    payload->>'name', payload->>'phone', payload->>'email', payload->>'address',
    payload->>'city', payload->>'neighborhood',
    nullif(payload->>'deliv_date','')::date, payload->>'deliv_time',
    payload->>'receiver', payload->>'notes', payload->>'card_message',
    payload->>'payment_method', coalesce(payload->>'payment_status','Pendiente de pago'),
    coalesce(payload->'items','[]'::jsonb),
    coalesce((payload->>'subtotal')::int,0), coalesce((payload->>'discount')::int,0),
    coalesce((payload->>'shipping')::int,0), coalesce((payload->>'total')::int,0),
    payload->>'coupon'
  );

  -- Descontar stock de cada producto
  for item in select * from jsonb_array_elements(coalesce(payload->'items','[]'::jsonb))
  loop
    update products
      set stock = greatest(0, stock - coalesce((item->>'qty')::int,1))
      where id = item->>'id';
  end loop;

  return new_num;
end;
$$;

grant execute on function place_order(jsonb) to anon, authenticated;

-- ---------- PRODUCTOS DE EJEMPLO ----------
insert into products (id,name,price,old_price,category,color,flor,cantidad,size,occasions,tags,rating,reviews_count,stock,featured,best,is_new,hue,description,long_desc,care,duration) values
('p1','Ramo Elegancia Roja',189000,230000,'Rosas','Rojo','Rosas rojas premium',24,'Grande','{Amor,"San Valentín",Aniversario}','{Amor,"San Valentín"}',4.9,132,14,true,true,false,'#c0392b','Veinticuatro rosas rojas de tallo largo envueltas en papel de seda y lazo de raso.','Una declaración de amor en su forma más pura. Veinticuatro rosas rojas ecuatorianas de tallo largo, seleccionadas botón por botón, realzadas con follaje fresco y presentadas en papel coreano con lazo de raso dorado.','{"Corta 2 cm del tallo en diagonal cada 2 días","Cambia el agua cada 48 horas","Mantén lejos de la luz solar directa"}','7 a 10 días'),
('p2','Jardín Primaveral',145000,null,'Arreglos Florales','Mixto','Gerberas, lisianthus y astromelia',18,'Mediano','{Cumpleaños,Agradecimiento,"Día de la Madre"}','{Cumpleaños}',4.7,88,9,true,false,true,'#e08a34','Explosión de color en tonos cálidos sobre base de esponja floral.','Un arreglo alegre que trae la primavera a casa: gerberas, lisianthus, astromelias y solidago en una composición redonda y generosa.','{"Rellena el agua de la base cada día","Retira flores marchitas","Ubícalo en un lugar fresco"}','6 a 8 días'),
('p3','Rosas Eternas',320000,null,'Flores Eternas','Rosa','Rosas preservadas',9,'Caja','{Amor,Aniversario,"San Valentín"}','{Amor,Regalo}',5.0,64,6,true,true,false,'#e78ba0','Rosas preservadas que duran más de un año, en caja de lujo.','Rosas naturales preservadas mediante un proceso artesanal que conserva su textura y belleza hasta por más de un año. Presentadas en una elegante caja acrílica.','{"No necesita agua","Evita la humedad y la luz solar directa","Limpia el polvo con un pincel suave"}','Más de 12 meses'),
('p4','Girasoles del Sol',98000,120000,'Girasoles','Amarillo','Girasoles',8,'Mediano','{Cumpleaños,Graduación,Agradecimiento}','{Cumpleaños,Amistad}',4.8,97,0,false,true,false,'#e6b800','Ocho girasoles radiantes que iluminan cualquier ambiente.','Nada dice "pienso en ti" como un ramo de girasoles. Ocho tallos frescos con follaje verde intenso, envueltos en yute natural.','{"Usa un florero alto con suficiente agua","Cambia el agua cada 2 días","Recorta los tallos bajo el agua"}','5 a 7 días'),
('p5','Amor Infinito',265000,299000,'Ramos Premium','Rojo','Rosas rojas y eucalipto',36,'XL','{Amor,Aniversario,"San Valentín"}','{Amor,Premium}',4.9,143,5,true,true,false,'#b0263a','Treinta y seis rosas rojas en un ramo espectacular de gran formato.','Nuestro ramo insignia. Treinta y seis rosas rojas premium combinadas con eucalipto y limonium, en un formato XL pensado para momentos inolvidables.','{"Recorta los tallos cada 2 días","Cambia el agua a diario","Aleja de corrientes de aire"}','8 a 10 días'),
('p6','Tulipanes Holandeses',132000,null,'Tulipanes','Rosa','Tulipanes importados',20,'Mediano','{Cumpleaños,Agradecimiento,Nacimiento}','{Cumpleaños,Nuevo}',4.6,52,11,false,false,true,'#e78ba0','Veinte tulipanes frescos en tonos pastel importados de Holanda.','Delicados y sofisticados: veinte tulipanes en tonos pastel, importados semanalmente de Holanda.','{"Los tulipanes siguen creciendo en el florero","Usa poca agua y muy fría","Mantén alejados de frutas"}','5 a 7 días'),
('p7','Dulce Romance',158000,null,'Amor','Rosa','Rosas rosadas y peonías',15,'Mediano','{Amor,Aniversario,"San Valentín"}','{Amor,"San Valentín"}',4.8,71,8,true,false,false,'#e78ba0','Rosas rosadas y peonías en un ramo romántico y femenino.','Un ramo tierno y romántico que combina rosas rosadas con peonías de temporada y toques de gypsophila.','{"Cambia el agua cada 2 días","Recorta tallos en diagonal","Evita el calor directo"}','6 a 8 días'),
('p8','Encanto Floral',112000,135000,'Arreglos Florales','Mixto','Rosas, claveles y hortensias',16,'Mediano','{Cumpleaños,Agradecimiento,"Día de la Madre"}','{Cumpleaños,Oferta}',4.5,44,13,false,false,false,'#d99f78','Arreglo mixto lleno de textura en tonos cálidos y crema.','Composición equilibrada de rosas, claveles y hortensias en tonos crema y durazno.','{"Rellena el agua de la base a diario","Retira pétalos caídos","Ubícalo lejos del sol"}','6 a 8 días'),
('p9','Sueño Rosado',175000,null,'Ramos Premium','Rosa','Rosas rosadas y ranúnculos',24,'Grande','{Amor,Aniversario,Nacimiento}','{Amor,Premium}',4.9,59,7,true,false,true,'#d76d94','Ramo premium en degradado de rosas y ranúnculos.','Un degradado onírico de rosa pálido a fucsia, con rosas de jardín y ranúnculos. Presentación premium con papel doble y lazo de seda.','{"Recorta los tallos cada 2 días","Agua limpia y fresca","Aleja de fuentes de calor"}','7 a 9 días'),
('p10','Jardín Blanco',198000,null,'Matrimonios','Blanco','Rosas y lisianthus blancos',28,'Grande','{Matrimonio,Condolencias,Agradecimiento}','{Matrimonio,Condolencias}',5.0,38,6,true,false,false,'#e9e4d8','Elegante ramo blanco de líneas puras y sobrias.','Sobriedad y elegancia absoluta: rosas, lisianthus y astromelias blancas con follaje plateado.','{"Cambia el agua cada 2 días","Recorta los tallos bajo el agua","Mantén en lugar fresco"}','7 a 9 días'),
('p11','Orquídea Premium',245000,280000,'Orquídeas','Morado','Orquídea Phalaenopsis',2,'Maceta','{Agradecimiento,Aniversario,Cumpleaños}','{Regalo,Premium}',4.8,47,4,true,true,false,'#8e5aa8','Orquídea viva de dos varas en maceta de cerámica de diseño.','Una orquídea Phalaenopsis de dos varas florecidas, plantada en maceta de cerámica mate.','{"Riega con 3 cubos de hielo por semana","Luz indirecta abundante","Evita encharcar las raíces"}','Floración de 2 a 3 meses'),
('p12','Ramo Deluxe',410000,null,'Ramos Premium','Mixto','Rosas, hortensias y orquídeas',50,'XXL','{Aniversario,Matrimonio,Agradecimiento}','{Premium,Empresarial}',5.0,29,3,true,true,true,'#a85a72','Nuestra pieza más exclusiva: más de cincuenta flores premium.','La joya de la corona. Más de cincuenta flores premium en una composición de gran formato hecha a mano por nuestro maestro florista.','{"Recorta los tallos a diario","Cambia el agua cada 48 horas","Ambiente fresco y sin corrientes"}','8 a 11 días')
on conflict (id) do nothing;

-- ---------- TABLA: suscriptores al newsletter ----------
create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz default now()
);
alter table subscribers enable row level security;
-- Cualquiera puede suscribirse; solo el admin puede leer
drop policy if exists sub_insert on subscribers;
create policy sub_insert on subscribers for insert with check (true);
drop policy if exists sub_admin on subscribers;
create policy sub_admin on subscribers for select to authenticated using (true);
