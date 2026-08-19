/**
 * api/send-email.js — Vercel Serverless Function
 * Envía correos usando Resend (resend.com — 3.000 correos/mes gratis)
 *
 * Variables de entorno requeridas en Vercel → Settings → Environment Variables:
 *   RESEND_API_KEY   → tu clave API de resend.com (empieza con "re_")
 *   RESEND_FROM      → correo remitente verificado, ej: pedidos@tudominio.co
 *                      Si no tienes dominio propio usa: onboarding@resend.dev
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[send-email] RESEND_API_KEY no configurada — email omitido');
    return res.status(200).json({ ok: false, reason: 'no_api_key' });
  }

  try {
    const { to, subject, html, replyTo } = req.body;
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Faltan campos requeridos: to, subject, html' });
    }

    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';

    const payload = {
      from,
      to: [to],
      subject,
      html,
    };
    if (replyTo) payload.reply_to = replyTo;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (!r.ok) {
      console.error('[send-email] Resend error:', data);
      return res.status(500).json({ error: 'Email no enviado', detail: data });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('[send-email] Error inesperado:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
