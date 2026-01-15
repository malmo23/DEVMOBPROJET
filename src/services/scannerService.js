const localDb = {
  "3017620422003": {
    product: "Nutella 400g",
    score: 38,
    allergens: ["Hazelnuts", "Milk", "Soy"],
    risks: ["Very high sugar", "Palm oil", "Additives"],
    cancerRisk: "Moderate (palm oil)",
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
    risks: ["Very high sugar (10.6g per 100ml)", "Phosphoric acid", "Caffeine"],
    cancerRisk: "Low (high sugar may increase risk indirectly)",
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

// Fast barcode analysis - removed artificial delay
export const analyzeBarcode = async (barcode) => {
  // Check local database first for instant results
  if (localDb[barcode]) {
    return localDb[barcode];
  }

  // If not in local DB, try to fetch from Open Food Facts API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Product not found');

    const data = await response.json();

    if (data.status === 1 && data.product) {
      return formatProductData(data.product, barcode);
    }
  } catch (error) {
    // Handle AbortError separately to avoid console errors
    if (error.name === 'AbortError') {
      console.log('Barcode API request timed out');
    } else if (error.message) {
      console.log('Barcode API Error:', error.message);
    }
    // Continue to fallback
  }

  // Fallback for unknown products
  return {
    product: `Product ${barcode}`,
    score: 50,
    allergens: [],
    risks: ["No data available in database"],
    cancerRisk: "Not classified",
    nutritionInfo: {
      calories: 'N/A',
      protein: 'N/A',
      carbs: 'N/A',
      fat: 'N/A',
      sugar: 'N/A',
      salt: 'N/A',
    },
    ingredients: 'Not available',
    source: 'Unknown Product'
  };
};

// AI-powered product search using Open Food Facts API
export const analyzeProductByName = async (productName) => {
  console.log('🔍 Searching for product:', productName);

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds

    // Search using Open Food Facts API with more results
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&json=1&page_size=5`;
    console.log('📡 API URL:', searchUrl);

    const response = await fetch(searchUrl, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('❌ API response not OK:', response.status);
      throw new Error('API request failed');
    }

    const data = await response.json();
    console.log('📦 API Response:', {
      count: data.count,
      page_size: data.page_size,
      productsFound: data.products?.length || 0
    });

    if (!data.products || data.products.length === 0) {
      console.log('⚠️ No products found in API, using AI fallback');
      return generateAIAnalysis(productName, null);
    }

    // Log first product found
    const product = data.products[0];
    console.log('✅ Found product:', product.product_name || 'Unknown name');
    console.log('📊 Product data available:', {
      hasName: !!product.product_name,
      hasNutriments: !!product.nutriments,
      hasIngredients: !!product.ingredients_text,
      nutriScore: product.nutriscore_grade || 'N/A'
    });

    return formatProductData(product, productName);
  } catch (error) {
    // Handle AbortError separately to avoid console errors
    if (error.name === 'AbortError') {
      console.log('⏱️ Product search request timed out');
    } else if (error.message) {
      console.log('❌ API Error:', error.message);
    }
    console.log('🤖 Using AI fallback analysis');
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
  console.log('🤖 Generating AI analysis for:', productName);
  const lower = productName.toLowerCase();
  let score = 50;
  const risks = [];
  const allergens = [];

  // Beverages
  if (lower.includes('soda') || lower.includes('cola') || lower.includes('pepsi') || lower.includes('sprite') || lower.includes('fanta')) {
    score = 15;
    risks.push('Very high sugar content (10-11g per 100ml)', 'Caffeine', 'Artificial sweeteners', 'Phosphoric acid');
  } else if (lower.includes('energy drink') || lower.includes('red bull') || lower.includes('monster')) {
    score = 10;
    risks.push('Extremely high sugar', 'Very high caffeine', 'Taurine', 'Artificial additives');
  } else if (lower.includes('juice') && !lower.includes('100%')) {
    score = 40;
    risks.push('Added sugars', 'May contain preservatives');
  } else if (lower.includes('water') || lower.includes('tea') && lower.includes('green')) {
    score = 95;
    risks.push('No significant risks');
  }

  // Sweets & Snacks
  else if (lower.includes('candy') || lower.includes('chocolate') || lower.includes('nutella') || lower.includes('snickers') || lower.includes('kitkat')) {
    score = 30;
    risks.push('Very high sugar content', 'High fat content', 'High calories');
    allergens.push('May contain milk', 'May contain nuts', 'May contain soy');
  } else if (lower.includes('chips') || lower.includes('crisps') || lower.includes('doritos') || lower.includes('lays')) {
    score = 25;
    risks.push('High sodium content', 'High fat content', 'Artificial flavors');
  } else if (lower.includes('cookie') || lower.includes('biscuit') || lower.includes('oreo')) {
    score = 35;
    risks.push('High sugar', 'High fat', 'Refined flour');
  }

  // Grains & Bread
  else if (lower.includes('bread') && (lower.includes('whole') || lower.includes('grain'))) {
    score = 75;
    risks.push('May contain gluten');
  } else if (lower.includes('bread') || lower.includes('baguette')) {
    score = 60;
    risks.push('Refined flour', 'May contain gluten', 'High carbohydrates');
  } else if (lower.includes('pasta') || lower.includes('rice')) {
    score = 65;
    risks.push('High carbohydrates', 'May contain gluten');
  }

  // Fruits & Vegetables
  else if (lower.includes('vegetable') || lower.includes('carrot') || lower.includes('broccoli') || lower.includes('spinach')) {
    score = 90;
    risks.push('No significant risks', 'Rich in vitamins and minerals');
  } else if (lower.includes('fruit') || lower.includes('apple') || lower.includes('banana') || lower.includes('orange')) {
    score = 85;
    risks.push('Natural sugars (healthy)', 'Rich in vitamins');
  }

  // Dairy
  else if (lower.includes('milk') && !lower.includes('chocolate')) {
    score = 70;
    risks.push('Lactose (for intolerant individuals)');
    allergens.push('Milk');
  } else if (lower.includes('yogurt') || lower.includes('yoghurt')) {
    score = 75;
    risks.push('May contain added sugars', 'Contains probiotics (beneficial)');
    allergens.push('Milk');
  } else if (lower.includes('cheese')) {
    score = 55;
    risks.push('High fat content', 'High sodium');
    allergens.push('Milk');
  }

  // Meat & Protein
  else if (lower.includes('chicken') || lower.includes('fish') || lower.includes('salmon')) {
    score = 80;
    risks.push('Ensure proper cooking', 'High protein (beneficial)');
  } else if (lower.includes('beef') || lower.includes('pork') || lower.includes('bacon')) {
    score = 50;
    risks.push('High saturated fat', 'High cholesterol');
  }

  // Default
  else {
    risks.push('Unable to find detailed data. Please verify ingredients on product label.');
  }

  return {
    product: productName,
    score,
    allergens,
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
    ingredients: 'Not available - AI estimated analysis',
    source: 'AI Analysis (limited data)'
  };
};
