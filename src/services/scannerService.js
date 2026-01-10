const localDb = {
  "3017620422003": { product: "Nutella 400g", score: 38, allergens: ["Hazelnuts", "Milk", "Soy"], risks: ["Very high sugar", "Palm oil", "Additives"], cancerRisk: "Moderate (palm oil)" },
  "5449000000996": { product: "Coca-Cola", score: 12, allergens: [], risks: ["73g sugar", "Phosphoric acid"], cancerRisk: "High with regular use" },
};

export const analyzeBarcode = async (barcode) => {
  await new Promise(r => setTimeout(r, 1200));
  return localDb[barcode] || { product: "Unknown product", score: 65, allergens: [], risks: ["No data"], cancerRisk: "Not classified" };
};

// AI-powered product search using Open Food Facts API
export const analyzeProductByName = async (productName) => {
  try {
    // Search using Open Food Facts API
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&json=1&page_size=1`,
      { timeout: 10000 }
    );

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return generateAIAnalysis(productName, null);
    }

    const product = data.products[0];
    return formatProductData(product, productName);
  } catch (error) {
    console.log('API Error:', error);
    return generateAIAnalysis(productName, null);
  }
};

const formatProductData = (product, searchTerm) => {
  const name = product.product_name || searchTerm;
  const score = product.nutriscore_grade ? scoreToNumber(product.nutriscore_grade) : calculateScore(product);

  const allergens = product.allergens_tags ? product.allergens_tags.map(a => a.replace('en:', '').toUpperCase()) : [];

  const nutritionInfo = {
    calories: product.nutriments?.['energy-kcal'] || product.nutriments?.['energy-kcal_100g'] || 'N/A',
    protein: product.nutriments?.['proteins_100g'] || 'N/A',
    carbs: product.nutriments?.['carbohydrates_100g'] || 'N/A',
    fat: product.nutriments?.['fat_100g'] || 'N/A',
    sugar: product.nutriments?.['sugars_100g'] || 'N/A',
    salt: product.nutriments?.['salt_100g'] || 'N/A',
  };

  const risks = identifyRisks(product, nutritionInfo);
  const cancerRisk = assessCancerRisk(product, nutritionInfo);

  return {
    product: name,
    score,
    allergens,
    nutritionInfo,
    risks,
    cancerRisk,
    brands: product.brands || 'Unknown',
    ingredients: product.ingredients_text_en || product.ingredients_text || 'Not available',
    source: 'Open Food Facts Database'
  };
};

const scoreToNumber = (grade) => {
  const gradeMap = { 'a': 90, 'b': 75, 'c': 55, 'd': 35, 'e': 15 };
  return gradeMap[grade.toLowerCase()] || 50;
};

const calculateScore = (product) => {
  let score = 100;
  const nuts = product.nutriments || {};

  if (nuts['sugars_100g'] > 15) score -= 20;
  if (nuts['fat_100g'] > 20) score -= 15;
  if (nuts['salt_100g'] > 1) score -= 10;
  if (nuts['energy-kcal_100g'] > 300) score -= 10;

  return Math.max(10, score);
};

const identifyRisks = (product, nutrition) => {
  const risks = [];

  if (nutrition.sugar !== 'N/A' && parseFloat(nutrition.sugar) > 15) {
    risks.push(`High sugar content (${nutrition.sugar}g per 100g)`);
  }
  if (nutrition.fat !== 'N/A' && parseFloat(nutrition.fat) > 20) {
    risks.push(`High fat content (${nutrition.fat}g per 100g)`);
  }
  if (nutrition.salt !== 'N/A' && parseFloat(nutrition.salt) > 1) {
    risks.push(`High sodium content (${nutrition.salt}g per 100g)`);
  }

  const additives = product.additives_tags || [];
  if (additives.length > 0) {
    risks.push(`Contains ${additives.length} additives/preservatives`);
  }

  if (product.ingredients_text?.toLowerCase().includes('palm oil')) {
    risks.push('Contains palm oil');
  }

  if (risks.length === 0) {
    risks.push('Moderate health profile');
  }

  return risks;
};

const assessCancerRisk = (product, nutrition) => {
  if (product.ingredients_text?.toLowerCase().includes('nitrite') ||
    product.ingredients_text?.toLowerCase().includes('nitrate')) {
    return 'Moderate (contains preservatives)';
  }

  if (nutrition.sugar !== 'N/A' && parseFloat(nutrition.sugar) > 20) {
    return 'Low (high sugar may increase cancer risk indirectly)';
  }

  if (product.additives_tags?.length > 5) {
    return 'Low (multiple additives)';
  }

  return 'Not classified';
};

const generateAIAnalysis = (productName, productData) => {
  // Fallback AI analysis when API fails
  const lower = productName.toLowerCase();
  let score = 50;
  const risks = [];

  if (lower.includes('soda') || lower.includes('cola') || lower.includes('energy drink')) {
    score = 20;
    risks.push('High sugar content', 'Caffeine', 'Artificial sweeteners');
  } else if (lower.includes('candy') || lower.includes('chocolate')) {
    score = 35;
    risks.push('High sugar', 'High fat');
  } else if (lower.includes('bread') || lower.includes('grain')) {
    score = 75;
    risks.push('May contain gluten');
  } else if (lower.includes('vegetable') || lower.includes('fruit')) {
    score = 85;
    risks.push('No significant risks');
  } else {
    risks.push('Unable to find detailed data. Please verify ingredients on product label.');
  }

  return {
    product: productName,
    score,
    allergens: [],
    nutritionInfo: {
      calories: 'N/A',
      protein: 'N/A',
      carbs: 'N/A',
      fat: 'N/A',
      sugar: 'N/A',
      salt: 'N/A',
    },
    risks,
    cancerRisk: 'Not classified',
    source: 'AI Analysis (limited data)'
  };
};
