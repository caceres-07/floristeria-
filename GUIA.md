# 🌸 Flor & Alma — Guía para publicar tu tienda

Esta guía te lleva de cero a tener tu floristería **en línea, con base de datos real, pagos por Nequi/Bancolombia y visible en Google**. No necesitas saber programar. Todo lo que se cobra tiene **plan gratis** (solo Wompi cobra una comisión cuando te pagan).

Tiempo aproximado: **30–45 minutos.**

---

## 📦 Lo que recibiste

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La tienda completa (lo que ven tus clientes y tu panel admin) |
| `config.js` | **El único archivo que editas.** Aquí van tu WhatsApp, Nequi, dominio y llaves |
| `supabase-schema.sql` | Crea tu base de datos con un clic |
| `api/wompi-signature.js` | Prepara el pago automático de Wompi de forma segura |
| `api/wompi-webhook.js` | Confirma automáticamente cuando un cliente te paga |
| `robots.txt` y `sitemap.xml` | Para que Google encuentre tu tienda |
| `GUIA.md` | Este documento |

> **Modo demostración:** si abres `index.html` sin configurar nada, la tienda funciona con datos de prueba guardados solo en tu navegador. Sirve para verla, pero **no es compartida**. Para que varios clientes la usen de verdad, sigue el Paso 2 (base de datos).

---

## Paso 1 · Pon tus datos (5 min)

Abre `config.js` con cualquier editor de texto (el Bloc de notas sirve) y rellena:

```js
negocio: {
  nombre: "Flor & Alma",
  whatsapp: "573044029343",        // ← ya está el tuyo
  correo: "tucorreo@ejemplo.com",
  direccion: "Tu dirección real",
  ciudad: "Bogotá",
  urlSitio: "https://tudominio.com"
},
pagoManual: {
  nequi: "304 402 9343",           // ← tu Nequi
  bancolombia: { numero: "...", titular: "...", cedula: "..." }
}
```

Guarda. Con solo esto, **los pagos por transferencia Nequi/Bancolombia ya funcionan** (el cliente transfiere y te envía el comprobante por WhatsApp; tú confirmas en el panel).

---

## Paso 2 · Crea tu base de datos (10 min) — Supabase

Esto es lo que hace que la tienda sea **real y compartida**: los pedidos, productos y ventas se guardan en la nube y los ves desde cualquier dispositivo.

1. Entra a **https://supabase.com** → **Start your project** → crea cuenta (gratis).
2. **New project**. Ponle nombre (ej. *floryalma*), una contraseña de base de datos y elige región **East US** (la más cercana). Espera 1–2 min.
3. En el menú izquierdo abre **SQL Editor** → **New query**.
4. Abre el archivo `supabase-schema.sql`, **copia todo** y pégalo. Pulsa **Run** (▶). Debe decir *Success*. Esto crea tus tablas, la seguridad y carga los 12 productos de ejemplo.
5. Ve a **Settings (⚙) → API** y copia dos datos:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **anon public** (una llave larga que empieza por `eyJ...`)
6. Pégalos en `config.js`:
   ```js
   supabase: {
     url: "https://abcd1234.supabase.co",
     anonKey: "eyJhbGciOi..."
   }
   ```
7. **Crea tu usuario de administrador** (solo tú entrarás al panel):
   - Menú **Authentication → Users → Add user → Create new user**.
   - Escribe tu correo y una contraseña. Marca *Auto Confirm User*. **Create user.**
   - Con ese correo y contraseña entrarás al panel en `tudominio.com/#/admin`.
8. **Activa el aviso en tiempo real** (para que suene cuando entre un pedido):
   - Menú **Database → Replication** (o **Realtime**) → activa la tabla **orders**.

Listo: ya tienes base de datos real y login de administrador. 🎉

---

## Paso 3 · Publica la tienda (10 min) — Vercel

Vercel pone tu tienda en internet gratis y le da una dirección `https://...`.

**Opción A — la más fácil (arrastrar y soltar):**
1. Entra a **https://vercel.com** → crea cuenta gratis.
2. En el panel, busca **Add New → Project → Deploy** y arrastra la **carpeta completa** del proyecto (con `index.html`, `config.js`, la carpeta `api`, etc.).
3. En 1 minuto te da un enlace tipo `https://floryalma.vercel.app`. **Ese enlace ya lo puedes compartir.** ✅

**Opción B — con GitHub (recomendada para actualizar fácil):**
1. Sube la carpeta a un repositorio en **https://github.com**.
2. En Vercel: **Add New → Project → Import** ese repositorio → **Deploy**.
3. Cada vez que cambies algo en GitHub, Vercel actualiza la tienda sola.

> Después de publicar, abre `tudominio/#/admin`, entra con tu correo y contraseña, y verás el panel con pedidos, productos, inventario y ventas.

---

## Paso 4 · Pago automático con Wompi (opcional, 10 min)

El pago manual ya funciona. Si quieres que el cliente **pague en línea y el pedido se confirme solo** (Nequi, Bancolombia, PSE y tarjetas), usa Wompi (es de Bancolombia).

1. Crea tu cuenta gratis en **https://comercios.wompi.co** y completa la verificación del negocio.
2. En el panel de Wompi, sección de **llaves/configuración**, copia:
   - **Llave pública** (`pub_prod_...`)
   - **Secreto de integridad**
   - **Secreto de eventos**
3. En `config.js`, sección `wompi`, pon la **llave pública**, tu **redirectUrl** (tu dominio) y `activarPruebas: false`.
4. En **Vercel → tu proyecto → Settings → Environment Variables**, agrega estas 4 variables (no van en config.js por seguridad):
   | Variable | Valor |
   |---|---|
   | `WOMPI_INTEGRITY_SECRET` | tu secreto de integridad |
   | `WOMPI_EVENTS_SECRET` | tu secreto de eventos |
   | `SUPABASE_URL` | la Project URL de Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** (¡secreta!) |
5. Vuelve a desplegar (Vercel → **Redeploy**).
6. En el panel de Wompi, en **Eventos/Webhook**, pon la URL:
   `https://tudominio.com/api/wompi-webhook`

Ahora, cuando un cliente elige *Pago en línea*, va a Wompi, paga, y tu pedido se marca **Pagado → Confirmado** automáticamente.

> **Comisión:** Wompi cobra un porcentaje por cada pago recibido (consulta sus tarifas). El pago manual por transferencia no tiene comisión.

---

## Paso 5 · Tu dominio propio y aparecer en Google

### Dominio propio (ej. `floryalma.co`)
1. Compra el dominio (Namecheap, GoDaddy, o `.co` en Colombia con proveedores como Mi.com.co).
2. En **Vercel → tu proyecto → Settings → Domains**, escribe tu dominio y sigue las instrucciones (copiar unos registros DNS donde compraste el dominio).
3. Actualiza en `config.js` el campo `urlSitio`, y cambia `floryalma.co` por tu dominio en `sitemap.xml` y `robots.txt`.

### Que salga en Google cuando alguien la busque
1. **Google Search Console** — https://search.google.com/search-console
   - Agrega tu dominio, verifica la propiedad (Vercel te ayuda con un registro DNS).
   - En **Sitemaps**, envía: `https://tudominio.com/sitemap.xml`.
   - En pocos días Google empieza a mostrar tu tienda en las búsquedas.
2. **Google Business Profile (lo más importante para una floristería)** — https://business.google.com
   - Registra tu negocio con nombre, dirección, teléfono, horario y fotos.
   - Esto hace que aparezcas en **Google Maps** y en el recuadro lateral cuando busquen "floristería en tu ciudad". Para un negocio local, esto trae más clientes que el SEO normal.
3. Consejos de posicionamiento: pide reseñas a tus clientes, publica fotos reales de tus ramos, y mantén el mismo nombre, dirección y teléfono en todos lados.

---

## 🖥️ Cómo usar tu panel de administración

Entra a `tudominio.com/#/admin` con tu correo y contraseña.

- **Resumen:** total de pedidos, ventas acumuladas, pendientes y alertas de inventario bajo.
- **Pedidos:** cada pedido con cliente, contacto, productos, total y método de pago. Cambia el estado (Pendiente → Confirmado → Preparando → En camino → Entregado), marca pagos verificados, escribe al cliente por WhatsApp con un clic y **exporta todo a Excel/CSV**. Cuando entra un pedido nuevo, **suena un aviso** y aparece al instante.
- **Productos:** agregar, editar, cambiar precios, stock, fotos (pega la URL de una imagen) y destacar. Los cambios se guardan en la base de datos y los ven todos los clientes al instante.
- **Inventario:** ajusta existencias, ve productos agotados/bajos y cuántas unidades se han vendido.

Nadie más puede ver esta sección: está protegida por tu correo y contraseña.

---

## 💡 Notas finales

- **Fotos de productos:** por ahora cada producto muestra una ilustración elegante generada automáticamente. Para poner fotos reales, sube tus imágenes (por ejemplo a Supabase → Storage, o a cualquier servicio que te dé un enlace) y pega la **URL** en el campo *URL de imagen* al editar el producto. No hay que tocar código.
- **Costos:** Supabase y Vercel tienen planes gratuitos generosos, suficientes para empezar. Solo pagas comisión a Wompi cuando recibes pagos en línea, y el dominio (~$30.000–$60.000 COP al año).
- **Seguridad:** las llaves *service_role* y los *secretos* de Wompi van **solo** en las variables de entorno de Vercel, nunca en `config.js`.
- Si algo no carga, revisa que copiaste bien la URL y la llave *anon* de Supabase en `config.js`.

¿Dudas en algún paso? Dime en cuál y te guío con más detalle. 🌷
