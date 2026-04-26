import { searchProducts } from './src/services/scannerService.js';

const start = Date.now();
searchProducts('nutella').then(res => {
  const end = Date.now();
  console.log(`Search success: ${res.length} items in ${end - start}ms`);
  process.exit(0);
}).catch(err => {
  console.error('Search error:', err);
  process.exit(1);
});
