const localDb = {
  "3017620422003": { 
    product: "Nutella 400g", 
    score: 38, 
    allergens: ["Hazelnuts", "Milk", "Soy"], 
    diseasePredictions: ["Type 2 Diabetes (Chronic sugar exposure)", "Hyperlipidemia (High Cholesterol)", "Obesity-related complications"],
    imageUrl: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.581.400.jpg",
    nutritionInfo: {
      calories: 539,
      protein: 6.3,
      carbs: 57.5,
      fat: 30.9,
      sugar: 56.3,
      salt: 0.107
    },
    ingredients: "Sugar, Palm Oil, Hazelnuts (13%), Skimmed Milk Powder (8.7%), Fat-Reduced Cocoa (7.4%), Emulsifier: Lecithins (Soya), Vanillin",
    source: "Local Database"
  },
  "5449000000996": { 
    product: "Coca-Cola", 
    score: 12, 
    allergens: [], 
    diseasePredictions: ["Metabolic Syndrome", "Insulin Resistance", "Chronic Dental Erosion", "Increased Kidney Strain"],
    imageUrl: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_fr.661.400.jpg",
    nutritionInfo: {
      calories: 42,
      protein: 0,
      carbs: 10.6,
      fat: 0,
      sugar: 10.6,
      salt: 0
    },
    ingredients: "Carbonated Water, Sugar, Colour (Caramel E150d), Phosphoric Acid, Natural Flavourings including Caffeine",
    source: "Local Database"
  },
};

// Fast barcode analysis
export const analyzeBarcode = async (barcode) => {
  // Check local database first for instant results
  if (localDb[barcode]) {
    return localDb[barcode];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();

    if (data.status === 1 && data.product) {
      return formatProductData(data.product, barcode);
    }

    // Fallback for unknown products
    return { 
      product: `Unknown Product (${barcode})`, 
      score: 50, 
      allergens: [], 
      diseasePredictions: ["No long-term data found for this barcode"], 
      nutritionInfo: { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fat: 'N/A', sugar: 'N/A', salt: 'N/A' },
      ingredients: 'Not available',
      source: 'Unknown Product',
      imageUrl: null 
    };
  } catch (error) {
    console.log('Barcode API Error:', error);
    return localDb[barcode] || { 
      product: "Connection Error", 
      score: 50, 
      allergens: [], 
      diseasePredictions: ["Long-term data unavailable due to connection error"], 
      imageUrl: null,
      source: 'Offline Fallback'
    };
  }
};

// AI-powered product search using Open Food Facts API
export const analyzeProductByName = async (productName) => {
  console.log('🔍 Searching for product:', productName);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&json=1&page_size=5`;
    const response = await fetch(searchUrl, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return generateAIAnalysis(productName, null);
    }

    return formatProductData(data.products[0], productName);
  } catch (error) {
    console.log('Product search error:', error.message);
    return generateAIAnalysis(productName, null);
  }
};

const predictDiseases = (product, nutrition) => {
  const predictions = [];
  const sugar = parseFloat(nutrition.sugar);
  const salt = parseFloat(nutrition.salt);
  const fat = parseFloat(nutrition.fat);
  const ingredients = (product.ingredients_text || '').toLowerCase();
  const additives = product.additives_tags || [];

  if (!isNaN(sugar) && sugar > 15) {
    predictions.push("Type 2 Diabetes (Chronic exposure to high sugar)");
    predictions.push("Metabolic Syndrome & Insulin Resistance");
    predictions.push("Non-alcoholic Fatty Liver Disease");
  }

  if (!isNaN(salt) && salt > 1.2) {
    predictions.push("Hypertension (Chronic High Blood Pressure)");
    predictions.push("Cardiovascular Heart Disease");
  }

  if (!isNaN(fat) && fat > 20) {
    predictions.push("Hyperlipidemia (High Cholesterol)");
    predictions.push("Coronary Artery Disease");
  }

  if (ingredients.includes('nitrite') || ingredients.includes('nitrate')) {
    predictions.push("Colorectal Cancer risk (linked to nitrates)");
  }
  
  if (ingredients.includes('palm oil')) {
    predictions.push("Increased Risk of Atherosclerosis");
  }

  if (additives.length > 5) {
    predictions.push("Chronic Systemic Inflammation");
  }

  if (predictions.length === 0) {
    predictions.push("Low risk for chronic diseases with balanced use");
  }

  return predictions;
};

const formatProductData = (product, searchTerm) => {
  const name = product.product_name || searchTerm;
  const score = product.nutriscore_grade ? scoreToNumber(product.nutriscore_grade) : calculateScore(product);

  const allergens = product.allergens_tags ? product.allergens_tags.map(a => a.replace('en:', '').toUpperCase()) : [];

  const nutritionInfo = {
    calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 'N/A',
    protein: product.nutriments?.['proteins_100g'] || 'N/A',
    carbs: product.nutriments?.['carbohydrates_100g'] || 'N/A',
    fat: product.nutriments?.['fat_100g'] || 'N/A',
    sugar: product.nutriments?.['sugars_100g'] || 'N/A',
    salt: product.nutriments?.['salt_100g'] || 'N/A',
  };

  return {
    product: name,
    score,
    allergens,
    nutritionInfo,
    diseasePredictions: predictDiseases(product, nutritionInfo),
    brands: product.brands || 'Unknown',
    ingredients: product.ingredients_text_en || product.ingredients_text || 'Not available',
    source: 'Open Food Facts Database',
    imageUrl: product.image_url || product.image_front_url || null
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
  return Math.max(10, score);
};

const generateAIAnalysis = (productName, productData) => {
  const lower = productName.toLowerCase();
  let score = 50;
  const diseasePredictions = [];

  if (lower.includes('soda') || lower.includes('cola')) {
    score = 20;
    diseasePredictions.push('Type 2 Diabetes', 'Metabolic Syndrome', 'Dental Caries');
  } else if (lower.includes('candy') || lower.includes('chocolate')) {
    score = 35;
    diseasePredictions.push('Obesity', 'Insulin Resistance');
  } else if (lower.includes('vegetable') || lower.includes('fruit')) {
    score = 85;
    diseasePredictions.push('Low risk for chronic diseases');
  } else {
    diseasePredictions.push('Inconclusive data for long-term prediction.');
  }

  return {
    product: productName,
    score,
    allergens: [],
    nutritionInfo: { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fat: 'N/A', sugar: 'N/A', salt: 'N/A' },
    diseasePredictions,
    ingredients: 'Not available (AI estimation)',
    source: 'AI Analysis',
    imageUrl: null
  };
};
