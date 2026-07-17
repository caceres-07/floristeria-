# 🌿 Guía de Administración — Flor & Alma

> Esta guía es para el **dueño o encargado de la tienda**. Explica cómo gestionar productos, pedidos, imágenes e inventario desde el panel de administración, sin necesidad de saber programar.

---

## 1. Cómo entrar al panel

1. Abre tu tienda en el navegador (ej: `https://floryalma.vercel.app`).
2. En la barra de dirección escribe al final: `#/admin`
   - Ejemplo completo: `https://floryalma.vercel.app/#/admin`
3. Escribe tu **correo** y **contraseña** (los que configuraste en Supabase → Authentication → Users).
4. Haz clic en **Ingresar**.

> 💡 **Tip:** Guarda la URL `tudominio.com/#/admin` como marcador en el navegador para entrar rápido.

---

## 2. El panel — resumen de secciones

Una vez adentro verás 4 secciones en el menú lateral:

| Sección | Para qué sirve |
|---|---|
| 📊 **Resumen** | Ver ventas, pedidos pendientes y alertas de inventario bajo |
| 🧾 **Pedidos** | Gestionar todos los pedidos recibidos |
| 🌹 **Productos** | Agregar, editar y eliminar productos del catálogo |
| 📦 **Inventario** | Ajustar el stock disponible de cada producto |

---

## 3. Gestionar pedidos

### Ver un pedido
En la tabla de pedidos encontrarás por cada uno:
- **Número de pedido** (ej: FA-260716-4521)
- **Cliente**: nombre, dirección, barrio
- **Contacto**: teléfono y correo. Un botón **✆ WhatsApp** te abre un mensaje pre-llenado.
- **Productos**: qué pidió y cuántas unidades
- **Total** y **método de pago**
- **Estado del pago** y **estado del pedido**

### Cambiar el estado de un pedido
En la columna **Estado** hay un menú desplegable. Los estados en orden son:

```
Pendiente → Confirmado → Preparando → En camino → Entregado
                                                  ↘ Cancelado
```

1. Cuando llega un pedido nuevo → está en **Pendiente** (suena un aviso).
2. Cuando verificas el pago → cámbialo a **Confirmado**.
3. Cuando tu florista lo está armando → **Preparando**.
4. Cuando sale a domicilio → **En camino**.
5. Cuando el mensajero lo entrega → **Entregado**.

### Marcar un pago como recibido
- Si el cliente pagó por Nequi o Bancolombia y te envió el comprobante, haz clic en el botón **"Marcar pagado"** en la columna de pago.
- Si el pago es automático (Wompi), esto se hace solo.

### Contactar al cliente por WhatsApp
- Haz clic en **✆ WhatsApp** en la fila del pedido. Se abrirá WhatsApp Web con un mensaje ya escrito con el número del pedido.

### Exportar a Excel
- En la sección **Pedidos**, botón **⬇ Exportar CSV**.
- Abre el archivo descargado en Excel → ya está listo para imprimir o analizar.

---

## 4. Gestionar productos

### Agregar un producto nuevo

1. Ve a **🌹 Productos** → botón **+ Agregar producto**.
2. Rellena los campos:

| Campo | Qué poner |
|---|---|
| **Nombre** | Ej: "Ramo Primaveral" |
| **Categoría** | Rosas, Tulipanes, Arreglos Florales, etc. |
| **Precio** | En pesos colombianos (sin puntos ni comas, ej: 145000) |
| **Precio anterior** | Si está en oferta (ej: 180000). Déjalo vacío si no. |
| **Stock** | Cuántas unidades tienes disponibles |
| **Color** | Para el filtro de colores en la tienda |
| **Tipo de flores** | Ej: "Rosas rojas premium, eucalipto" |
| **Cantidad de flores** | Número de flores en el ramo |
| **Tamaño** | Mediano / Grande / XL / XXL / Caja / Maceta |
| **Color visual (hex)** | El color de la flor SVG si no hay foto (ej: `#C97D84`) |
| **URL de imagen** | La URL de una foto real (ver sección 5 👇) |
| **Descripción corta** | 1 línea que aparece en la tarjeta del catálogo |
| **Descripción completa** | 2-3 párrafos para la página de detalle |
| **Ocasiones** | Separadas por coma: `Amor, Aniversario, Cumpleaños` |
| **Cuidados del ramo** | Uno por línea: `Cambia el agua cada 2 días` |
| **Duración estimada** | Ej: `7 a 10 días` |
| **Destacado** ☑ | Aparece en la sección "Productos destacados" del inicio |
| **Más vendido** ☑ | Aparece en "Ramos más vendidos" |
| **Nuevo ingreso** ☑ | Aparece en "Nuevos ingresos" con la etiqueta NUEVO |

3. Haz clic en **Guardar producto**.
4. El producto aparece **al instante** en la tienda para todos los clientes.

### Editar un producto existente

1. Ve a **🌹 Productos**.
2. Busca el producto en la tabla y haz clic en **Editar**.
3. Modifica los campos que necesites.
4. Haz clic en **Guardar producto**.

> ✅ Los cambios (precio, foto, descripción) se ven al instante en la tienda.

### Eliminar un producto

1. Ve a **🌹 Productos**.
2. Haz clic en **Eliminar** (en rojo) en la fila del producto.
3. Confirma la eliminación.

> ⚠️ La eliminación es permanente. Si solo quieres ocultarlo temporalmente, pon el stock en 0.

---

## 5. Cómo agregar fotos de productos

La tienda acepta cualquier URL de imagen pública (que empiece por `https://`). Aquí las mejores opciones:

### Opción A — Supabase Storage ✅ (recomendada, ya la tienes)

1. En tu proyecto de Supabase, ve al menú **Storage**.
2. Haz clic en **New bucket**, nómbralo `products` y márcalo como **Public**. Haz clic en **Save**.
3. Entra al bucket `products` y haz clic en **Upload file**.
4. Sube la foto de tu ramo (JPG o PNG, máx. 50 MB).
5. Haz clic en el archivo subido → botón **Get URL** o **Copy URL**.
6. Copia esa URL (tiene el formato `https://abc.supabase.co/storage/v1/object/public/products/tu-foto.jpg`).
7. En el panel admin, al editar el producto, pégala en el campo **URL de imagen**.
8. **Guarda**. La foto aparece al instante.

### Opción B — imgBB (gratis y muy fácil)

1. Entra a **https://imgbb.com**.
2. Haz clic en **Choose file** y sube tu foto.
3. Haz clic en **Upload**.
4. En el resultado, copia el **"Direct link"** (no el HTML embed).
5. Pégalo en el campo **URL de imagen** del panel admin.

### Opción C — Google Drive (alternativa)

1. Sube la imagen a Google Drive.
2. Clic derecho → **Compartir** → **Cualquier usuario con el enlace puede ver**.
3. Copia el ID del archivo (el número largo en la URL).
4. Construye la URL así: `https://drive.google.com/uc?export=view&id=TU-ID`

> 💡 **Consejo:** Las imágenes cuadradas o con proporción 4:5 (vertical) se ven mejor en las tarjetas de producto. Tamaño recomendado: 800×1000 px.

---

## 6. Gestionar inventario

1. Ve a **📦 Inventario**.
2. Verás una tabla con:
   - **Disponible**: el stock actual (puedes editarlo directamente)
   - **Estado**: OK (verde) / Bajo (amarillo) / Agotado (rojo)
   - **Nivel**: barra visual del stock
   - **Vendidos**: cuántas unidades has vendido en total

3. Para ajustar el stock de un producto: haz clic en el número de la columna "Disponible", escribe el nuevo número y presiona **Enter** o haz clic fuera del campo.

> 📣 Cuando el stock de un producto llega a 5 unidades o menos, el panel muestra una alerta en el **Dashboard** y el botón "Comprar" en la tienda muestra "¡Últimas X!" en naranja. Cuando llega a 0 muestra "Agotado" y los botones de compra se desactivan.

---

## 7. El Dashboard (Resumen)

El Dashboard te muestra en tiempo real:

- **Pedidos totales**: todos los pedidos recibidos
- **Ventas acumuladas**: suma de todos los pedidos no cancelados
- **Pedidos pendientes**: los que aún no has confirmado
- **Bajo inventario**: productos con 5 o menos unidades

Y debajo, los **6 pedidos más recientes** para que los veas de un vistazo.

Cuando entra un pedido nuevo:
- 🔔 Suena un aviso sonoro (dos tonos suaves)
- Aparece un toast (notificación) en la esquina superior derecha
- La tabla se actualiza automáticamente

---

## 8. Cambiar precios de envío y cupones

Estas configuraciones están en `config.js`. Ábrelo con el Bloc de notas y edita:

```js
// Sección 5 — ENVÍO
envio: {
  costo: 12000,        // ← costo de envío en pesos
  gratisDesde: 250000  // ← monto mínimo para envío gratis
}
```

Para los cupones de descuento, busca en `index.html` la línea:
```js
const COUPONS = {'FLOR10':{type:'pct',val:10,label:'10% de descuento'}, ...}
```
Puedes editar los nombres, tipos (`pct` = porcentaje, `ship` = envío gratis) y valores.

> ⚠️ Después de cambiar `config.js` o `index.html`, sube los archivos de nuevo a Vercel para que los cambios se apliquen en la tienda en línea.

---

## 9. Newsletter (suscriptores)

Si alguien se suscribe al newsletter en el footer de la tienda, su correo queda guardado en la tabla `subscribers` de Supabase.

Para ver los suscriptores:
1. Entra a tu proyecto en **https://supabase.com**.
2. Ve a **Table Editor → subscribers**.
3. Exporta la tabla si necesitas enviar una campaña.

---

## 10. Cerrar sesión

Para salir del panel de administración, haz clic en **⎋ Salir** en el menú lateral.

Esto cierra tu sesión de forma segura. Nadie más puede entrar sin tu correo y contraseña.

---

## 11. Preguntas frecuentes del admin

**¿Puedo entrar al panel desde mi celular?**
Sí. El panel funciona en móvil, aunque es más cómodo en computador para gestionar muchos pedidos.

**¿Mis cambios se ven inmediatamente?**
Sí, en tiempo real. Cualquier cambio de precio, foto o stock aparece al instante para todos los clientes.

**¿Qué pasa si pongo mal el stock?**
Solo tú puedes cambiarlo. Ve a Inventario y corrígelo. No hay consecuencias más allá de lo que muestre la tienda.

**¿Puedo tener varios administradores?**
Sí. En Supabase → Authentication → Users puedes crear más usuarios. Todos tendrán acceso completo al panel.

**¿Cómo hago un pedido de prueba?**
Desde la tienda, haz un pedido normal. En el panel aparecerá con estado "Pendiente". Puedes cancelarlo o eliminarlo desde el panel de Supabase si no quieres que quede en las estadísticas.

---

*Flor & Alma · Panel de administración · Guía v1.0*
