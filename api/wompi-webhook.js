// ============================================================
// /api/wompi-webhook  — Vercel Serverless Function (Node)
// Wompi llama aquí automáticamente cuando cambia el estado de un
// pago. Verificamos la firma del evento y, si el pago fue
// APROBADO, marcamos el pedido como Pagado en Supabase.
//
// Variables de entorno necesarias en Vercel:
//   WOMPI_EVENTS_SECRET      = secreto de eventos (Wompi → Config → Eventos)
//   SUPABASE_URL             = https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY= llave "service_role" (Supabase → Settings → API)
//
// Configura la URL de este endpoint en el panel de Wompi:
//   https://TU-DOMINIO/api/wompi-webhook
// ============================================================
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    let event = req.body;
    if (typeof event === 'string') event = JSON.parse(event || '{}');

    // 1) Verificar la firma del evento
    const secret = process.env.WOMPI_EVENTS_SECRET;
    const sig = event.signature || {};
    const props = sig.properties || [];
    const tx = event.data && event.data.transaction ? event.data.transaction : {};

    let cadena = '';
    for (const p of props) {
      // p viene como "transaction.amount_in_cents", etc.
      const val = p.split('.').reduce((o, k) => (o ? o[k] : undefined), event.data);
      cadena += (val === undefined || val === null) ? '' : val;
    }
    cadena += event.timestamp + secret;
    const calc = crypto.createHash('sha256').update(cadena).digest('hex');

    if (!secret || calc !== sig.checksum) {
      return res.status(401).json({ error: 'Firma inválida' });
    }

    // 2) Solo nos interesan las transacciones aprobadas
    const reference = tx.reference;      // = order_num
    const status = tx.status;            // APPROVED / DECLINED / VOIDED / ERROR
    if (!reference) return res.status(200).json({ ok: true });

    const mapa = {
      APPROVED: { payment_status: 'Pagado', status: 'Confirmado' },
      DECLINED: { payment_status: 'Rechazado' },
      VOIDED:   { payment_status: 'Anulado' },
      ERROR:    { payment_status: 'Error de pago' }
    };
    const update = mapa[status];
    if (!update) return res.status(200).json({ ok: true });
    update.wompi_ref = tx.id || reference;

    // 3) Actualizar el pedido en Supabase (REST con service_role)
    const url = `${process.env.SUPABASE_URL}/rest/v1/orders?order_num=eq.${encodeURIComponent(reference)}`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(update)
    });
    if (!r.ok) return res.status(500).json({ error: 'No se pudo actualizar el pedido' });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
