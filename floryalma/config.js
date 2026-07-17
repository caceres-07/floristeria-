/* ============================================================
   FLOR & ALMA — CONFIGURACIÓN
   Este es el ÚNICO archivo que necesitas editar para poner en
   marcha tu tienda real. Rellena los datos y guarda.
   Mientras las llaves de Supabase estén vacías, la tienda
   funciona en "modo demostración" (datos solo en tu navegador).
   ============================================================ */
window.CONFIG = {

  /* ---- 1. NEGOCIO (aparece en la web y en Google) ---- */
  negocio: {
    nombre: "Flor & Alma",
    eslogan: "Floristería de autor",
    ciudad: "Bogotá",
    direccion: "Cra. 13 #85-32, Chapinero",   // ← tu dirección real
    correo: "hola@floryalma.co",               // ← tu correo real
    whatsapp: "573044029343",                  // ← tu WhatsApp (país+numero, sin +)
    telefonoVisible: "+57 304 402 9343",
    urlSitio: "https://floryalma.co",          // ← el dominio que publiques
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/"
  },

  /* ---- 2. PAGOS MANUALES (funcionan HOY, sin cuenta de pasarela) ----
     El cliente ve estos datos, transfiere y te envía el comprobante
     por WhatsApp. Tú confirmas el pago en el panel. */
  pagoManual: {
    nequi: "304 402 9343",                     // ← tu Nequi
    bancolombia: {
      tipo: "Ahorros",
      numero: "000-000000-00",                 // ← tu cuenta Bancolombia
      titular: "Nombre del titular",
      cedula: "C.C. 0000000000"
    }
  },

  /* ---- 3. WOMPI (pago automático opcional: Nequi, Bancolombia, PSE, tarjetas) ----
     Crea tu cuenta gratis en https://comercios.wompi.co
     Copia tus llaves. Si las dejas vacías, se usa solo el pago manual. */
  wompi: {
    publicKey: "",       // pub_prod_xxx o pub_test_xxx
    redirectUrl: "",     // ej: https://floryalma.co  (a donde vuelve tras pagar)
    // La firma de integridad se calcula en el servidor (/api/wompi-signature)
    // usando tu "secreto de integridad". NO lo pongas aquí.
    activarPruebas: true // true = modo sandbox de Wompi
  },

  /* ---- 4. SUPABASE (base de datos real + login admin + tiempo real) ----
     Crea tu proyecto gratis en https://supabase.com
     Pega la URL y la llave "anon public" (Settings → API). */
  supabase: {
    url: "",             // https://xxxxxxxx.supabase.co
    anonKey: ""          // eyJhbGciOi... (llave anon / public)
  },

  /* ---- 5. ENVÍO ---- */
  envio: {
    costo: 12000,
    gratisDesde: 250000
  }
};
