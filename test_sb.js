async function testSupabase() {
  const url = 'https://qphwknltplaqdiulvhvc.supabase.co/rest/v1/products?select=*';
  const anonKey = 'sb_publishable_Sfzg6X2eJUoV3XWVcgft-w_6Ozf0OFj';
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch(e) {
    console.log("Error:", e.message);
  }
}
testSupabase();
