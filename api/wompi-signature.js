// ============================================================
// /api/wompi-signature  — Vercel Serverless Function (Node)
// Genera la "firma de integridad" que Wompi exige para el
// checkout, usando tu SECRETO DE INTEGRIDAD guardado como
// variable de entorno (NUNCA en el frontend).
//
// Variables de entorno necesarias en Vercel:
//   WOMPI_INTEGRITY_SECRET = tu secreto de integridad de Wompi
//
// Petición (POST JSON): { reference, amountInCents, currency }
// Respuesta: { signature, reference, amountInCents, currency }
// ============================================================
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  // En Vercel: agrega la variable ALLOWED_ORIGIN con tu dominio (ej: https://floryalma.co)
  // para que solo tu tienda pueda pedir firmas. Si no se configura, permite todos los orígenes.
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const secret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!secret) return res.status(500).json({ error: 'Falta WOMPI_INTEGRITY_SECRET' });

    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    const { reference, amountInCents, currency = 'COP' } = body || {};
    if (!reference || !amountInCents) {
      return res.status(400).json({ error: 'Faltan reference o amountInCents' });
    }

    // Wompi: SHA256( reference + amountInCents + currency + integritySecret )
    const cadena = `${reference}${amountInCents}${currency}${secret}`;
    const signature = crypto.createHash('sha256').update(cadena).digest('hex');

    return res.status(200).json({ signature, reference, amountInCents, currency });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
