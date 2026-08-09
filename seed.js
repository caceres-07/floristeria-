const fs = require('fs');

const SEED_PRODUCTS = [
  {id:'p1', name:'Ramo Elegancia Roja', price:189000, old_price:230000, category:'Bouquets', color:'Rojo', flor:'Rosas rojas premium', cantidad:24, size:'Grande', rating:4.9, stock:14, featured:true, best:true, is_new:false, description:'Veinticuatro rosas rojas de tallo largo envueltas en papel de seda y lazo de raso.', long_desc:'Una declaración de amor en su forma más pura. Veinticuatro rosas rojas ecuatorianas de tallo largo, seleccionadas botón por botón, realzadas con follaje fresco y presentadas en papel coreano con lazo de raso dorado. El clásico que nunca falla.', hue:'#c0392b'},
  {id:'p2', name:'Jardín Primaveral', price:145000, old_price:null, category:'Bouquets', color:'Mixto', flor:'Gerberas, lisianthus y astromelia', cantidad:18, size:'Mediano', rating:4.7, stock:9, featured:true, best:false, is_new:true, description:'Explosión de color en tonos cálidos sobre base de esponja floral.', long_desc:'Un arreglo alegre que trae la primavera a casa: gerberas, lisianthus, astromelias y solidago en una composición redonda y generosa. Llega listo para lucir sobre cualquier mesa.', hue:'#e08a34'},
  {id:'p3', name:'Rosas Eternas', price:320000, old_price:null, category:'Cajas Florales', color:'Rosa', flor:'Rosas preservadas', cantidad:9, size:'Caja', rating:5.0, stock:6, featured:true, best:true, is_new:false, description:'Rosas preservadas que duran más de un año, en caja de lujo.', long_desc:'Rosas naturales preservadas mediante un proceso artesanal que conserva su textura y belleza hasta por más de un año. Presentadas en una elegante caja acrílica. Un recuerdo que perdura tanto como el sentimiento.', hue:'#e78ba0'},
  {id:'p4', name:'Girasoles del Sol', price:98000, old_price:120000, category:'Bouquets', color:'Amarillo', flor:'Girasoles', cantidad:8, size:'Mediano', rating:4.8, stock:0, featured:false, best:true, is_new:false, description:'Ocho girasoles radiantes que iluminan cualquier ambiente.', long_desc:'Nada dice "pienso en ti" como un ramo de girasoles. Ocho tallos frescos con follaje verde intenso, envueltos en yute natural. Energía y alegría en un solo detalle.', hue:'#e6b800'},
  {id:'p5', name:'Amor Infinito', price:265000, old_price:299000, category:'Gran Formato', color:'Rojo', flor:'Rosas rojas y eucalipto', cantidad:36, size:'XL', rating:4.9, stock:5, featured:true, best:true, is_new:false, description:'Treinta y seis rosas rojas en un ramo espectacular de gran formato.', long_desc:'Nuestro ramo insignia. Treinta y seis rosas rojas premium combinadas con eucalipto y limonium, en un formato XL pensado para momentos inolvidables. Impacto garantizado.', hue:'#b0263a'},
  {id:'p6', name:'Tulipanes Holandeses', price:132000, old_price:null, category:'Bouquets', color:'Rosa', flor:'Tulipanes importados', cantidad:20, size:'Mediano', rating:4.6, stock:11, featured:false, best:false, is_new:true, description:'Veinte tulipanes frescos en tonos pastel importados de Holanda.', long_desc:'Delicados y sofisticados: veinte tulipanes en tonos pastel, importados semanalmente de Holanda. Un ramo primaveral de líneas limpias, perfecto para quien ama la elegancia discreta.', hue:'#e78ba0'},
  {id:'p7', name:'Dulce Romance', price:158000, old_price:null, category:'Bouquets', color:'Rosa', flor:'Rosas rosadas y peonías', cantidad:15, size:'Mediano', rating:4.8, stock:8, featured:true, best:false, is_new:false, description:'Rosas rosadas y peonías en un ramo romántico y femenino.', long_desc:'Un ramo tierno y romántico que combina rosas rosadas con peonías de temporada y toques de gypsophila. Envuelto en papel rosa pastel con detalle dorado.', hue:'#e78ba0'},
  {id:'p8', name:'Encanto Floral', price:112000, old_price:135000, category:'Bouquets', color:'Mixto', flor:'Rosas, claveles y hortensias', cantidad:16, size:'Mediano', rating:4.5, stock:13, featured:false, best:false, is_new:false, description:'Arreglo mixto lleno de textura en tonos cálidos y crema.', long_desc:'Composición equilibrada de rosas, claveles y hortensias en tonos crema y durazno. Un arreglo versátil que combina con cualquier espacio y ocasión.', hue:'#d99f78'},
  {id:'p9', name:'Sueño Rosado', price:175000, old_price:null, category:'Diseños Premium Zoler', color:'Rosa', flor:'Rosas rosadas y ranúnculos', cantidad:24, size:'Grande', rating:4.9, stock:7, featured:true, best:false, is_new:true, description:'Ramo premium en degradado de rosas y ranúnculos.', long_desc:'Un degradado onírico de rosa pálido a fucsia, con rosas de jardín y ranúnculos. Presentación premium con papel doble y lazo de seda. Puro romanticismo.', hue:'#d76d94'},
  {id:'p10', name:'Jardín Blanco', price:198000, old_price:null, category:'Gran Formato', color:'Blanco', flor:'Rosas y lisianthus blancos', cantidad:28, size:'Grande', rating:5.0, stock:6, featured:true, best:false, is_new:false, description:'Elegante ramo blanco de líneas puras y sobrias.', long_desc:'Sobriedad y elegancia absoluta: rosas, lisianthus y astromelias blancas con follaje plateado. Perfecto para bodas, ceremonias o para expresar respeto y afecto.', hue:'#e9e4d8'},
  {id:'p11', name:'Orquídea Premium', price:245000, old_price:280000, category:'Detalles & Extras', color:'Morado', flor:'Orquídea Phalaenopsis', cantidad:2, size:'Maceta', rating:4.8, stock:4, featured:true, best:true, is_new:false, description:'Orquídea viva de dos varas en maceta de cerámica de diseño.', long_desc:'Una orquídea Phalaenopsis de dos varas florecidas, plantada en maceta de cerámica mate. Un regalo vivo y sofisticado que puede florecer durante meses con los cuidados adecuados.', hue:'#8e5aa8'},
  {id:'p12', name:'Ramo Deluxe', price:410000, old_price:null, category:'Diseños Premium Zoler', color:'Mixto', flor:'Rosas, hortensias y orquídeas', cantidad:50, size:'XXL', rating:5.0, stock:3, featured:true, best:true, is_new:true, description:'Nuestra pieza más exclusiva: más de cincuenta flores premium.', long_desc:'La joya de la corona. Más de cincuenta flores premium —rosas, hortensias, orquídeas y follajes selectos— en una composición de gran formato hecha a mano por nuestro maestro florista. Para ocasiones que lo merecen todo.', hue:'#a85a72'}
];

async function seed() {
  const url = 'https://qphwknltplaqdiulvhvc.supabase.co/rest/v1/products';
  const anonKey = 'sb_publishable_Sfzg6X2eJUoV3XWVcgft-w_6Ozf0OFj';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(SEED_PRODUCTS)
    });
    console.log("Seed status:", res.status);
    console.log("Response:", await res.text());
  } catch(e) {
    console.error("Error seeding:", e);
  }
}
seed();
