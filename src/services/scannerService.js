const localDb = {
  "3017620422003": { 
    product: "Nutella 400g", 
    score: 38, 
    allergens: ["Hazelnuts", "Milk", "Soy"], 
    diseasePredictions: ["Type 2 Diabetes (Chronic sugar exposure)", "Hyperlipidemia (High Cholesterol)", "Obesity-related complications"],
    imageUrl: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.581.400.jpg"
  },
  "5449000000996": { 
    product: "Coca-Cola", 
    score: 12, 
    allergens: [], 
    diseasePredictions: ["Metabolic Syndrome", "Insulin Resistance", "Chronic Dental Erosion", "Increased Kidney Strain"],
    imageUrl: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_fr.661.400.jpg"
  },
};

export const analyzeBarcode = async (barcode) => {
  // Artificial delay to make analysis feel more thorough (3-5s)
  await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
  
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { timeout: 10000 }
    );

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();

    if (data.status === 1 && data.product) {
      return formatProductData(data.product, `Barcode: ${barcode}`);
    }

    // Fallback to local DB if available
    return localDb[barcode] || { 
      product: "Unknown product", 
      score: 65, 
      allergens: [], 
      diseasePredictions: ["No long-term data found for this barcode"], 
      imageUrl: null 
    };
  } catch (error) {
    console.log('Barcode API Error:', error);
    return localDb[barcode] || { 
      product: "Unknown product", 
      score: 65, 
      allergens: [], 
      diseasePredictions: ["Long-term data unavailable due to connection error"], 
      imageUrl: null
    };
  }
};

// AI-powered product search using Open Food Facts API
export const analyzeProductByName = async (productName) => {
  // Artificial delay to make analysis feel more thorough (3-5s)
  await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));

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

const predictDiseases = (product, nutrition) => {
  const predictions = [];
  const sugar = parseFloat(nutrition.sugar);
  const salt = parseFloat(nutrition.salt);
  const fat = parseFloat(nutrition.fat);
  const ingredients = (product.ingredients_text || '').toLowerCase();
  const additives = product.additives_tags || [];

  // Sugar-related diseases
  if (!isNaN(sugar) && sugar > 15) {
    predictions.push("Type 2 Diabetes (Chronic exposure to high sugar)");
    predictions.push("Metabolic Syndrome & Insulin Resistance");
    predictions.push("Non-alcoholic Fatty Liver Disease");
  }

  // Salt-related diseases
  if (!isNaN(salt) && salt > 1.2) {
    predictions.push("Hypertension (Chronic High Blood Pressure)");
    predictions.push("Cardiovascular Heart Disease");
    predictions.push("Increased Stroke Risk");
  }

  // Fat/Obesity related
  if (!isNaN(fat) && fat > 20) {
    predictions.push("Hyperlipidemia (High Cholesterol)");
    predictions.push("Coronary Artery Disease");
    predictions.push("Obesity-related Complications");
  }

  // Cancer risks
  if (ingredients.includes('nitrite') || ingredients.includes('nitrate') || ingredients.includes('processed meat')) {
    predictions.push("Colorectal Cancer (linked to processed nitrates)");
  }
  
  if (ingredients.includes('palm oil')) {
    predictions.push("Increased Risk of Atherosclerosis");
  }

  if (additives.length > 5 || ingredients.includes('artificial')) {
    predictions.push("Chronic Systemic Inflammation");
    predictions.push("Potential Gut Microbiome Disruption");
  }

  if (predictions.length === 0) {
    if (product.nutriscore_grade === 'a' || product.nutriscore_grade === 'b') {
      predictions.push("Low risk for chronic diseases with balanced use");
    } else {
      predictions.push("General Metabolic Strain if consumed excessively");
    }
  }

  return predictions;
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

  const diseasePredictions = predictDiseases(product, nutritionInfo);

  return {
    product: name,
    score,
    allergens,
    nutritionInfo,
    diseasePredictions,
    brands: product.brands || 'Unknown',
    ingredients: product.ingredients_text_en || product.ingredients_text || 'Not available',
    source: 'Open Food Facts Database',
    imageUrl: product.image_url || product.image_front_url || product.image_small_url || null
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

const generateAIAnalysis = (productName, productData) => {
  // Fallback AI analysis when API fails
  const lower = productName.toLowerCase();
  let score = 50;
  const diseasePredictions = [];

  if (lower.includes('soda') || lower.includes('cola') || lower.includes('energy drink')) {
    score = 20;
    diseasePredictions.push('Type 2 Diabetes (High sugar consumption)', 'Metabolic Syndrome', 'Dental Caries');
  } else if (lower.includes('candy') || lower.includes('chocolate')) {
    score = 35;
    diseasePredictions.push('Obesity', 'Insulin Resistance', 'Metabolic Strain');
  } else if (lower.includes('bread') || lower.includes('grain')) {
    score = 75;
    diseasePredictions.push('Celiac Disease (if gluten sensitive)', 'Spiking Blood Glucose');
  } else if (lower.includes('vegetable') || lower.includes('fruit')) {
    score = 85;
    diseasePredictions.push('Low risk for chronic diseases with balanced use');
  } else {
    diseasePredictions.push('Inconclusive data for long-term prediction. Verify label for high sugar/salt.');
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
    diseasePredictions,
    source: 'AI Analysis (limited data)',
    imageUrl: null
  };
};
