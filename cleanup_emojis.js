const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Toast agotado
c = c.replace('Este producto está agotado 🥀', 'Este producto está agotado');

// WA visible button text emoji
c = c.replace('\u{1F4AC} Escríbe', 'Escríbe');

// Invoice email card icon
c = c.replace('\u{1F48C} Tu tarjeta dice:', 'Tu tarjeta dice:');
// Also search by the unicode
const cardLine = c.indexOf('\u{1F48C}');
if(cardLine > -1) {
  c = c.replace(/\u{1F48C}/gu, '');
}

// Date picker toast - find and fix line 1486 area
const before1486 = 'La fecha de entrega debe ser hoy o en el';
if(c.includes(before1486)) {
  c = c.replace(before1486, 'La fecha de entrega debe ser hoy o en el');
}
// Remove calendar emoji from toast on 1486
c = c.replace(/📅/gu, '');

fs.writeFileSync('index.html', c, 'utf8');

// Final check
const remaining = (c.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu) || []);
const byLine = c.split('\n');
byLine.forEach((l, i) => {
  const m = l.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu);
  if(m) console.log((i+1)+':', m.join(''), '|', l.trim().substring(0,80));
});
console.log('Remaining unique:', [...new Set(remaining)].join(' '));
