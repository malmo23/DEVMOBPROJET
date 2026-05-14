
const { searchProducts } = require('./scannerService');

async function testPredictions() {
  console.log('Testing predictions for: Prince');
  const results = await searchProducts('Prince');
  if (results.length > 0) {
    const product = results[0];
    console.log('Product:', product.product);
    console.log('Predictions:', JSON.stringify(product.predictions, null, 2));
  } else {
    console.log('No results found');
  }
}

testPredictions();
