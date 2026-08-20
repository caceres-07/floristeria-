const fs = require('fs');

// Load the last known good version (before our broken edits)
const backup = fs.readFileSync('index_backup.html', 'utf8');

// Verify backup is good
if (!backup.includes('function viewHome()')) {
  console.error('BACKUP DOES NOT HAVE viewHome! Aborting.');
  process.exit(1);
}

let c = backup;
console.log('Backup OK. viewHome found. Lines:', c.split('\n').length);

// ============================
// 1. Add @media print CSS
// ============================
const printCSS = `

/* ---------- Estilos de impresion (PDF de pedidos) ---------- */
@media print{
  body{background:#fff!important;color:#000!important;font-family:'Segoe UI',Arial,sans-serif;font-size:11px}
  .site,footer.site,.admin-side,#toasts,.wa-float,.chat-btn,.modal,.overlay,.drawer,.admin-head .btn{display:none!important}
  .admin-main{padding:0!important}
  table{width:100%;border-collapse:collapse;font-size:10px}
  th,td{border:1px solid #ccc;padding:5px 7px}
  th{background:#f5f5f5;font-weight:600}
  h2{font-size:16px;margin-bottom:8px}
  .kpis,select{display:none}
  @page{margin:15mm}
}`;
c = c.replace(
  '@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto}}',
  '@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto}}' + printCSS
);

// ============================
// 2. watchOrders + watchProducts
// ============================
c = c.replace(
  `  watchOrders(cb){\n    if(!ONLINE) return null;\n    return sb.channel('orders-rt').on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},payload=>{\n      cb(payload.new);\n    }).subscribe();\n  },`,
  `  watchOrders(cb){\n    if(!ONLINE) return null;\n    return sb.channel('orders-rt')\n      .on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},payload=>{ cb(payload.new); })\n      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'orders'},payload=>{ cb(payload.new); })\n      .subscribe();\n  },\n  watchProducts(cb){\n    if(!ONLINE) return null;\n    return sb.channel('products-rt')\n      .on('postgres_changes',{event:'*',schema:'public',table:'products'},payload=>{ cb(payload); })\n      .subscribe();\n  },`
);

// ============================
// 3. renderFilters fallback
// ============================
c = c.replace(
  'function renderFilters(){\n  const cats=[...new Set(PRODUCTS.map(p=>p.cat))];',
  'function renderFilters(){\n  const dynCats=[...new Set(PRODUCTS.map(p=>p.cat).filter(Boolean))];\n  const cats=dynCats.length?dynCats:CATEGORIES.map(c=>c.name);'
);

// ============================
// 4. placeOrder email fixes
// ============================
c = c.replace(
  'body:JSON.stringify({to:payload.email,subject:`\u2605 Tu pedido ${num} \u2014 ZOLER`,html:htmlFactura})',
  'body:JSON.stringify({to:payload.email,subject:`Pedido confirmado ${num} \u2014 ${negName}`,html:htmlFactura,replyTo:N.correo||undefined})'
);
c = c.replace(
  'body:JSON.stringify({to:adminEmail,subject:`\ud83c\udf38 Nuevo pedido ${num} \u2014 ${payload.name}`,html:htmlFactura})',
  'body:JSON.stringify({to:adminEmail,subject:`Nuevo pedido ${num} \u2014 ${payload.name}`,html:htmlFactura,replyTo:payload.email})'
);

// ============================
// 5. Confirmation page emojis
// ============================
c = c.replace('<div style="font-size:3.5rem">\ud83c\udf38</div>\n        ', '');
c = c.replace('\ud83c\udf38</div>\n        <span', '<span');
c = c.replace('# Pedido: <b>', 'Pedido: <b>');
c = c.replace('>\ud83d\udce7 Enviamos la factura a', '>Enviamos la factura a');
c = c.replace('\ud83d\udcf1 Enviar comprobante de pago', 'Enviar comprobante de pago');
c = c.replace('\ud83d\udcac Guardar factura en WhatsApp', 'Guardar factura en WhatsApp');
c = c.replace('Tarjeta \ud83d\udc8c</span>', 'Mensaje en tarjeta</span>');
c = c.replace('<span>Fecha</span>', '<span>Fecha de entrega</span>');
c = c.replace('\u00a1Gracias por tu compra!', 'Gracias por tu compra');

// ============================
// 6. readPost cleanup
// ============================
c = c.replace("N.nombre||'Flor & Alma')} cuidamos", "N.nombre||'ZOLER')} cuidamos");
c = c.replace("'¡Hola! Vi el artículo \"'+b.t+'\" y quiero más información \ud83c\udf38'", "'Hola, vi el artículo \"'+b.t+'\" y quiero más información.'");

// ============================
// 7. Admin panel emojis
// ============================
c = c.replace('<div style="font-size:3rem">\ud83c\udf3f</div>', '<div style="width:60px;height:60px;background:var(--gold-soft);border:1px solid rgba(201,168,76,.3);border-radius:50%;margin:0 auto .8rem;display:flex;align-items:center;justify-content:center"><span style="font-family:var(--serif);font-size:2rem;font-weight:700;color:var(--gold-z)">Z</span></div>');
c = c.replace("Acceso privado · ${esc(N.nombre||'Flor & Alma')}", "Acceso privado · ${esc(N.nombre||'ZOLER')}");
c = c.replace("${esc(N.nombre||'Flor & Alma')}</div>\n      ${[['dashboard','\ud83d\udcca Resumen']", "${esc(N.nombre||'ZOLER')}</div>\n      ${[['dashboard','Resumen']");
c = c.replace("['orders','\ud83e\uddfe Pedidos'],['products','\ud83c\udf39 Productos'],['inventory','\ud83d\udce6 Inventario']", "['orders','Pedidos'],['products','Productos'],['inventory','Inventario']");
c = c.replace('\u238b Salir', 'Salir');

// ============================
// 8. Dashboard pill/button
// ============================
c = c.replace('\ud83c\udf31 Cargar Productos Prueba', 'Cargar productos de prueba');
c = c.replace('\ud83d\udfe2 En tiempo real', 'En tiempo real');
// Replace CSV export with PDF + Excel
c = c.replace(
  'onclick="exportOrdersCSV()">\u2b07 Exportar CSV</button>',
  'onclick="exportOrdersPDF()" style="margin-right:.4rem">Exportar PDF</button><button class="btn btn-ghost btn-sm" onclick="exportOrdersCSV()">Exportar Excel</button>'
);

// ============================
// 9. Toasts
// ============================
c = c.replace('Bienvenido de vuelta \ud83c\udf3f', 'Bienvenido de vuelta');
c = c.replace('\ud83d\udd14 \u00a1Nuevo pedido! ', 'Nuevo pedido: ');
c = c.replace('\ud83d\udd14 \u00a1Nuevo pedido recibido! ', 'Nuevo pedido: ');
c = c.replace('Pago marcado \u2713', 'Pago marcado');
c = c.replace('\u26a0\ufe0f Bajo inventario:', 'Bajo inventario:');
c = c.replace('Producto guardado \ud83c\udf3f', 'Producto guardado correctamente');
c = c.replace('a\u00f1adido al carrito \ud83c\udf38', 'a\u00f1adido al carrito');
c = c.replace('agotado \ud83e\udd40', 'agotado');
c = c.replace('Guardado en favoritos \ud83d\udc9a', 'Guardado en favoritos');
c = c.replace('Cup\u00f3n aplicado \ud83c\udf9f\ufe0f', 'Cup\u00f3n aplicado');
c = c.replace('\u00a1Gracias por tu opini\u00f3n! \ud83c\udf1f', 'Gracias por tu opini\u00f3n');
c = c.replace('\u00a1Listo! Revisa tu correo \u2714', 'Suscripci\u00f3n confirmada. Revisa tu correo.');

// ============================
// 10. WA link default text
// ============================
c = c.replace("'¡Hola! Quiero información sobre sus flores \ud83c\udf38'", "'Hola, quiero información sobre sus arreglos florales.'");
c = c.replace('<div style="font-size:3rem">\ud83d\udcac</div>', '');

// ============================
// 11. ordersTable WA link
// ============================
c = c.replace(
  "'Hola '+o.name+', te escribo por tu pedido '+o.num+' \ud83c\udf38'",
  "'Hola '+o.name+', le escribo por su pedido '+o.num"
);
c = c.replace('\u2706 WhatsApp Cliente', 'Escribir por WhatsApp');

// ============================
// 12. Checkout icons
// ============================
c = c.replace('<span style="font-size:1.6rem">\ud83d\udcf2</span>', '');
c = c.replace('<span style="font-size:1.6rem">\ud83c\udfe6</span>', '');
c = c.replace('<span style="font-size:1.6rem">\ud83d\udcb5</span>', '');
c = c.replace('Mensaje para la tarjeta \ud83d\udc8c', 'Mensaje para la tarjeta');
c = c.replace('\ud83d\udd12 ', '');

// ============================
// 13. Empty states
// ============================
c = c.replace('<span class="em">\ud83c\udf37</span>', '');
c = c.replace('<span class="em">\ud83d\udc9a</span>', '');
c = c.replace('<span class="em">\ud83d\udd0d</span>', '');
c = c.replace('<span class="em">\ud83e\udd40</span>', '');
c = c.replace('<span class="em">\ud83d\uded2</span>', '');
c = c.replace('<span class="em">\ud83d\uddc2\ufe0f</span>A\u00fan no hay pedidos.', 'Sin pedidos en esta secci\u00f3n.');

// ============================
// 14. Invoice HTML emojis
// ============================
c = c.replace('\ud83d\udce6 ${info.address}', '${info.address}');
c = c.replace('\ud83d\udcc5 ${fmtD', '${fmtD');
c = c.replace('\ud83d\udc65 Recibe:', 'Recibe:');
c = c.replace('\ud83d\udc8c Tu tarjeta dice:', 'Tu tarjeta dice:');
c = c.replace('\u2605 Bienvenido a', 'Bienvenido a');
c = c.replace('Bienvenido a nuestra lista \u2b50', 'Bienvenido a nuestra lista');
// remove emoji from info-row icons in product page
c = c.replace('<div class="ic">\ud83d\udce6</div>', '<div class="ic">');
c = c.replace('<div class="ic">\ud83d\udcde</div>', '<div class="ic">');
c = c.replace('<div class="ic">\ud83d\udd51</div>', '<div class="ic">');

// ============================
// 15. startOrderWatch + products watcher
// ============================
c = c.replace(
  "orderChannel = DB.watchOrders(newOrder=>{\n      beep();\n      toast('\ud83d\udd14 \u00a1Nuevo pedido! '+(newOrder.order_num||''),'gold');\n      if(adminAuthed && (adminTab==='orders'||adminTab==='dashboard')) renderAdminMain();\n    });",
  "orderChannel = DB.watchOrders(newOrder=>{\n      beep();\n      toast('Nuevo pedido: '+(newOrder.order_num||''),'gold');\n      if(adminAuthed && (adminTab==='orders'||adminTab==='dashboard')) renderAdminMain();\n    });\n    DB.watchProducts(()=>{\n      DB.fetchProducts().then(p=>{ if(p&&p.length){ PRODUCTS=p; if($('#results')) renderResults(); }});\n    });"
);

// ============================
// 16. exportOrdersPDF function
// ============================
const pdfFn = `
function exportOrdersPDF(){
  const tab = window.adminOrderTab === 'archived'
    ? ORDERS_CACHE.filter(o=>o.state==='Entregado'||o.state==='Cancelado')
    : ORDERS_CACHE.filter(o=>o.state!=='Entregado'&&o.state!=='Cancelado');
  const titulo = window.adminOrderTab === 'archived' ? 'Pedidos Archivados' : 'Pedidos Activos';
  const esc2=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const rows = tab.map(o=>\`<tr>
    <td><b>\${o.num}</b></td>
    <td>\${esc2(o.name)}<br><small>\${esc2(o.phone)}<br>\${esc2(o.email)}</small></td>
    <td>\${o.delivDate||''} \${o.delivTime||''}<br>\${esc2(o.addr||'')}, \${esc2(o.city||'')}<br>Recibe: \${esc2(o.receiver||'El cliente')}</td>
    <td><small>\${(o.items||[]).map(i=>esc2(i.name)+' x'+i.qty).join('<br>')}</small></td>
    <td><small>\${esc2(o.notes||'--')}<br><i>\${esc2(o.card||'--')}</i></small></td>
    <td><b>$\${Number(o.total||0).toLocaleString('es-CO')}</b><br><small>\${esc2(o.pay||'')}</small></td>
    <td>\${o.state||''}</td>
    <td><small>\${new Date(o.date).toLocaleDateString('es-CO')}</small></td>
  </tr>\`).join('');
  const win=window.open('','_blank');
  win.document.write(\`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>\${titulo} — ZOLER</title>
    <style>body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;margin:0;padding:12mm}h1{font-size:15px;margin:0 0 3px}h2{font-size:10px;color:#666;margin:0 0 10px;font-weight:400}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left;vertical-align:top}th{background:#f0f0f0;font-weight:700;font-size:8px;text-transform:uppercase}tr:nth-child(even) td{background:#fafafa}small{color:#555;display:block;font-size:8px}i{color:#333}</style>
    </head><body>
    <h1>ZOLER — \${titulo}</h1><h2>Generado: \${new Date().toLocaleString('es-CO')}</h2>
    <table><thead><tr><th>Pedido</th><th>Cliente</th><th>Entrega</th><th>Productos</th><th>Notas / Tarjeta</th><th>Total / Pago</th><th>Estado</th><th>Fecha</th></tr></thead>
    <tbody>\${rows}</tbody></table>
    <script>setTimeout(()=>{window.print();window.onafterprint=()=>window.close();},400);<\\/script>
    </body></html>\`);
  win.document.close();
}
`;
c = c.replace('(async function(){', pdfFn + '\n(async function(){');

// ============================
// 17. Window exports
// ============================
c = c.replace(
  'exportOrdersCSV,subscribeNews',
  'exportOrdersCSV,exportOrdersPDF,seedDB,subscribeNews'
);

// ============================
// Verify
// ============================
const checks = {
  viewHome: c.includes('function viewHome()'),
  boot: c.includes('(async function()'),
  exportPDF: c.includes('function exportOrdersPDF'),
  watchProducts: c.includes('watchProducts(cb)'),
  printCSS: c.includes('@media print'),
};
console.log('Checks:', checks);

const lines = c.split('\n');
console.log('Total lines:', lines.length);

// Check braces in JS only
const scriptStart = c.lastIndexOf('<script>');
const scriptEnd = c.lastIndexOf('</script>');
const js = c.substring(scriptStart + 8, scriptEnd);
const opens = (js.match(/\{/g)||[]).length;
const closes = (js.match(/\}/g)||[]).length;
console.log('JS brace diff (should be 0):', opens - closes);

fs.writeFileSync('index.html', c, 'utf8');
console.log('index.html written successfully!');
