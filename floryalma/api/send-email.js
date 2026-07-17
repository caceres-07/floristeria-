/**
 * api/send-email.js — Vercel Serverless Function
 * Envía correos usando Resend (resend.com — 100 emails/día gratis)
 *
 * Variables de entorno requeridas en Vercel → Settings → Environment Variables:
 *   RESEND_API_KEY   → tu clave API de resend.com (empieza con "re_")
 *   RESEND_FROM      → correo verificado como remitente, ej: pedidos@floryalma.co
 *                      (si no tienes dominio propio, usa: onboarding@resend.dev)
 */
module.exports = async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Sin clave: no es un error crítico, la tienda sigue funcionando
    console.warn('[send-email] RESEND_API_KEY no configurada — email omitido');
    return res.status(200).json({ ok: false, reason: 'no_api_key' });
  }

  try {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Faltan campos: to, subject, html' });
    }

    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to: [to], subject, html })
    });

    const data = await r.json();

    if (!r.ok) {
      console.error('[send-email] Resend error:', data);
      return res.status(500).json({ error: 'Email no enviado', detail: data });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('[send-email] Error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
};
