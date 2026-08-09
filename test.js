const PRODUCTS = [
  {id:'p1', name:'Ramo Elegancia Roja', price:189000, old:230000, cat:'Rosas', tags:['Amor','San Valentín'], color:'Rojo', flor:'Rosas rojas premium', cantidad:24, size:'Grande', occasions:['Amor','San Valentín','Aniversario'], rating:4.9, reviews:132, stock:14, featured:true, best:true, isNew:false, desc:'Veinticuatro rosas rojas de tallo largo envueltas en papel de seda y lazo de raso.', long:'Una declaración de amor en su forma más pura. Veinticuatro rosas rojas ecuatorianas de tallo largo, seleccionadas botón por botón, realzadas con follaje fresco y presentadas en papel coreano con lazo de raso dorado. El clásico que nunca falla.', care:['Corta 2 cm del tallo en diagonal cada 2 días','Cambia el agua cada 48 horas','Mantén lejos de la luz solar directa y frutas'], dur:'7 a 10 días', hue:'#c0392b'},
];

let currentFilters = {q:'',cats:new Set(['Rosas']),colors:new Set(),occ:new Set(),size:new Set(),avail:false,sort:'destacados',max:2000000};

function renderResults() {
  const f=currentFilters; const q=f.q.toLowerCase().trim();
  let list=PRODUCTS.filter(p=>{
    if(f.cats.size && !f.cats.has(p.cat)) return false;
    if(f.colors.size && !f.colors.has(p.color)) return false;
    if(f.occ.size && !(p.occasions||[]).some(o=>f.occ.has(o))) return false;
    if(f.size.size && !f.size.has(p.size)) return false;
    if(f.avail && p.stock<=0) return false;
    if(p.price>f.max) return false;
    if(q){ const hay=`${p.name} ${p.desc} ${p.flor} ${p.color} ${p.cat} ${(p.occasions||[]).join(' ')} ${(p.tags||[]).join(' ')}`.toLowerCase(); if(!hay.includes(q)) return false; }
    return true;
  });
  console.log("Matched items:", list.length);
}

renderResults();
