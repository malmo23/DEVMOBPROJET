
async function testSearch(query) {
  const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?brands_tags=${encodeURIComponent(query)}&action=process&json=1&page_size=5`;
  console.log('Testing URL:', searchUrl);
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'FoodRisk-App - Android - Version 1.0'
      }
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('Found products:', data.products.length);
      if (data.products.length > 0) {
        data.products.slice(0, 3).forEach(p => {
          console.log(`- ${p.product_name} (${p.brands})`);
        });
      }
    } catch (e) {
      console.error('Failed to parse JSON. Response starts with:', text.substring(0, 100));
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

testSearch('prince');
