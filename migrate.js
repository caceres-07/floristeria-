const fs = require('fs');

async function migrate() {
  const url = 'https://qphwknltplaqdiulvhvc.supabase.co/rest/v1/products';
  const anonKey = 'sb_publishable_Sfzg6X2eJUoV3XWVcgft-w_6Ozf0OFj';
  
  const newCats = {
    'p1': 'Bouquets',
    'p2': 'Bouquets',
    'p3': 'Cajas Florales',
    'p4': 'Bouquets',
    'p5': 'Gran Formato',
    'p6': 'Bouquets',
    'p7': 'Bouquets',
    'p8': 'Bouquets',
    'p9': 'Diseños Premium Zoler',
    'p10': 'Gran Formato',
    'p11': 'Detalles & Extras',
    'p12': 'Diseños Premium Zoler'
  };

  try {
    const res = await fetch(url + '?select=id,category', {
      headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
    });
    const products = await res.json();
    
    for (const p of products) {
      if (newCats[p.id] && p.category !== newCats[p.id]) {
        console.log(`Updating ${p.id} from ${p.category} to ${newCats[p.id]}...`);
        const patchRes = await fetch(url + '?id=eq.' + p.id, {
          method: 'PATCH',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ category: newCats[p.id] })
        });
        console.log('Status:', patchRes.status);
      }
    }
    console.log("Migration complete.");
  } catch (e) {
    console.error("Error migrating:", e);
  }
}
migrate();
