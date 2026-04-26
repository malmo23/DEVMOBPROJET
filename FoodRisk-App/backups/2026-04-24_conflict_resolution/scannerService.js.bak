const localDb = {
  "3017620422003": { 
    product: "Nutella 400g", 
    score: 38, 
    allergens: ["Hazelnuts", "Milk", "Soy"], 
    risks: ["High sugar content (56.3g)", "High fat content (30.9g)", "Contains palm oil"],
    cancerRisk: "Low (high sugar may increase risk indirectly)",
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
    risks: ["Very high sugar content (10.6g)", "Phosphoric acid", "Caramel E150d"],
    cancerRisk: "Low (high sugar content)",
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

const HEADERS = {
  'User-Agent': 'FoodRisk-App/1.0 (Android; contact: support@foodrisk.app)'
};

// Fast barcode analysis
export const analyzeBarcode = async (barcode) => {
  console.log('🔍 Analyzing barcode:', barcode);
  
  // Check local database first for instant results
  if (localDb[barcode]) {
    console.log('✅ Found in local database');
    return localDb[barcode];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { 
        signal: controller.signal,
        headers: HEADERS
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();
    console.log('📦 API Data Status:', data.status);

    if (data.status === 1 && data.product) {
      console.log('✅ Product found in API:', data.product.product_name || barcode);
      return formatProductData(data.product, barcode);
    }

    console.log('⚠️ Product not found in API, using fallback');
    // Fallback for unknown products
    return { 
      product: `Unknown Product (${barcode})`, 
      score: 50, 
      allergens: [], 
      predictions: [{
        disease: 'Unknown Risk',
        probability: 'N/A',
        description: 'No data found for this barcode.'
      }],
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
      predictions: [{
        disease: 'Offline',
        probability: 'N/A',
        description: 'Check your internet connection.'
      }],
      imageUrl: null,
      source: 'Offline Fallback'
    };
  }
};

// AI-powered product search using Open Food Facts API
export const analyzeProductByName = async (productName) => {
  console.log('🔍 Searching for product:', productName);

  try {
    const results = await searchProducts(productName);
    if (results && results.length > 0) {
      return results[0]; // Default to first result for direct analysis
    }
    return generateAIAnalysis(productName, null);
  } catch (error) {
    console.log('Product search error:', error.message);
    return generateAIAnalysis(productName, null);
  }
};

export const searchProducts = async (productName) => {
  console.log('📡 Fetching suggestions for:', productName);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Improved search URL: removed search_simple=1, added sorting by popularity
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&action=process&json=1&page_size=20&sort_by=unique_scans_n`;
    
    let response = await fetch(searchUrl, { signal: controller.signal, headers: HEADERS });
    
    if (!response.ok) throw new Error('API request failed');

    let data = await response.json();
    
    // Fallback: If no products found, try a broader search or search by brand
    if (!data.products || data.products.length === 0) {
      console.log('🔄 No products found, trying fallback search...');
      const fallbackUrl = `https://world.openfoodfacts.org/cgi/search.pl?brands_tags=${encodeURIComponent(productName)}&action=process&json=1&page_size=10`;
      response = await fetch(fallbackUrl, { signal: controller.signal, headers: HEADERS });
      if (response.ok) {
        data = await response.json();
      }
    }

    clearTimeout(timeoutId);

    if (!data.products || data.products.length === 0) {
      return [];
    }

    return data.products.map(p => formatProductData(p, productName));
  } catch (error) {
    console.log('Search error:', error.message);
    return [];
  }
};

const generateDiseasePredictions = (product, nutrition) => {
  const predictions = [];
  const sugar = parseFloat(nutrition.sugar);
  const salt = parseFloat(nutrition.salt);
  const fat = parseFloat(nutrition.fat);
  const ingredients = (product.ingredients_text_en || product.ingredients_text || '').toLowerCase();
  
  // Diabetes Prediction
  if (!isNaN(sugar) && sugar > 18) {
    predictions.push({
      disease: 'Type 2 Diabetes',
      probability: 'High',
      description: 'Long-term consumption of such high sugar levels (18g+) is a primary driver of insulin resistance.'
    });
  } else if (!isNaN(sugar) && sugar > 8) {
    predictions.push({
      disease: 'Type 2 Diabetes',
      probability: 'Moderate',
      description: 'Frequent intake contributes to chronic blood sugar elevation.'
    });
  }

  // Obesity / Fatness
  if (!isNaN(fat) && fat > 25) {
    predictions.push({
      disease: 'Obesity & Metabolic Syndrome',
      probability: 'High',
      description: 'High lipid density promotes rapid fat storage and metabolic dysfunction.'
    });
  } else if (nutrition.calories > 350) {
    predictions.push({
      disease: 'Obesity',
      probability: 'Moderate',
      description: 'High calorie density contributes to long-term weight gain.'
    });
  }

  // Cancer Prediction
  const additives = product.additives_tags || [];
  if (ingredients.includes('nitrite') || ingredients.includes('nitrate') || additives.some(a => a.includes('e250') || a.includes('e251'))) {
    predictions.push({
      disease: 'Colorectal Cancer',
      probability: 'Moderate-High',
      description: 'Processed preservatives identified are classified as Group 1 carcinogens by IARC.'
    });
  } else if (additives.length > 6 || ingredients.includes('artificial color')) {
    predictions.push({
      disease: 'Systemic Inflammation',
      probability: 'Moderate',
      description: 'High additive count is linked to chronic inflammation, a precursor to various cancers.'
    });
  }

  // Hypertension
  if (!isNaN(salt) && salt > 1.3) {
    predictions.push({
      disease: 'Hypertension',
      probability: 'High',
      description: 'Extreme sodium levels cause persistent vascular strain and high blood pressure.'
    });
  }

  if (predictions.length === 0) {
    predictions.push({
      disease: 'Low Chronic Risk',
      probability: 'Very Low',
      description: 'No significant disease markers found for long-term consumption.'
    });
  }

  return predictions;
};

const formatProductData = (product, searchTerm) => {
  const name = product.product_name || searchTerm;
  const score = product.nutriscore_grade ? scoreToNumber(product.nutriscore_grade) : calculateScore(product);

  const allergens = Array.isArray(product.allergens_tags) 
    ? product.allergens_tags.map(a => typeof a === 'string' ? a.replace('en:', '').toUpperCase() : String(a)) 
    : [];

  const nutritionInfo = {
    calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 'N/A',
    protein: product.nutriments?.['proteins_100g'] || 'N/A',
    carbs: product.nutriments?.['carbohydrates_100g'] || 'N/A',
    fat: product.nutriments?.['fat_100g'] || 'N/A',
    sugar: product.nutriments?.['sugars_100g'] || 'N/A',
    salt: product.nutriments?.['salt_100g'] || 'N/A',
  };

  const formatted = {
    product: name,
    score,
    allergens,
    nutritionInfo,
    predictions: generateDiseasePredictions(product, nutritionInfo),
    brands: product.brands || 'Unknown',
    ingredients: product.ingredients_text_en || product.ingredients_text || 'Not available',
    source: 'Open Food Facts Database',
    imageUrl: product.image_url || product.image_front_url || null
  };
  
  console.log('✨ Formatted Result:', formatted.product, 'Score:', formatted.score);
  return formatted;
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

export const generateAIAnalysis = (productName, productData) => {
  const lower = productName.toLowerCase();
  let score = 50;
  const predictions = [];
  const allergens = [];

  if (lower.includes('soda') || lower.includes('cola')) {
    score = 20;
    predictions.push(
      { disease: 'Type 2 Diabetes', probability: 'High', description: 'Continuous exposure to liquid sugars.' },
      { disease: 'Obesity', probability: 'High', description: 'Empty calories and insulin spikes.' }
    );
  } else if (lower.includes('candy') || lower.includes('chocolate')) {
    score = 35;
    predictions.push(
      { disease: 'Diabetes', probability: 'High', description: 'High glycemic index ingredients.' },
      { disease: 'Dental Decay', probability: 'Extreme', description: 'Bacterial fermentation of sugars.' }
    );
  } else if (lower.includes('vegetable') || lower.includes('fruit')) {
    score = 85;
    predictions.push({ disease: 'Longevity Boost', probability: 'High', description: 'Rich in antioxidants and fiber.' });
  } else if (lower.includes('bread') || lower.includes('grain')) {
    score = 70;
    predictions.push({ disease: 'Inflammation', probability: 'Low', description: 'Minimal risk if whole grain.' });
  } else {
    predictions.push({ disease: 'General Risk', probability: 'Moderate', description: 'Inconclusive data, consume in moderation.' });
  }

  return {
    product: productName,
    score,
    allergens,
    nutritionInfo: { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fat: 'N/A', sugar: 'N/A', salt: 'N/A' },
    predictions,
    ingredients: 'Not available (AI estimation)',
    source: 'AI Analysis',
    imageUrl: null
  };
};
