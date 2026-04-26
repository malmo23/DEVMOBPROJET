import { searchProducts } from './src/services/scannerService.js';

searchProducts('nutella').then(res => {
  console.log('Search success:', res.length);
  process.exit(0);
}).catch(err => {
  console.error('Search error:', err);
  process.exit(1);
});
