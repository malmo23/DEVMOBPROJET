import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API key is loaded from .env (EXPO_PUBLIC_GEMINI_API_KEY)
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
console.log("🚀 Gemini AI Engine: ACTIVATED");


const localDb = {
  "3017620422003": {
    product: "Nutella 400g",
    score: 38,
    allergies: ["Hazelnuts", "Milk", "Soy"],
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
    allergies: [],
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
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 FoodRisk-App/1.0',
  'Accept': 'application/json'
};

// Gemini Prediction Logic
const getGeminiPrediction = async (productName, nutrition, ingredients) => {
  if (!genAI) return null;

  try {
    const { getHealthConditions } = require('../../database/sqlite');
    const healthProfile = await getHealthConditions();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Analyze this food product: "${productName}"
      Nutrition (per 100g): ${JSON.stringify(nutrition)}
      Ingredients: ${ingredients}
      
      ${healthProfile ? `USER HEALTH PROFILE: ${healthProfile}. IMPORTANT: Prioritize identifying risks and providing warnings specifically related to these conditions.` : ""}

      1. Predict 3-4 specific long-term health risks/diseases associated with chronic consumption.
      2. Identify all potential allergens/allergies present in the ingredients.

      Return ONLY a JSON object in this format:
      {
        "predictions": [{"disease": "Name", "probability": "High/Moderate/Low", "description": "1-sentence medical explanation"}],
        "allergies": ["ALLERGY1", "ALLERGY2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Improved JSON extraction
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.log('Gemini Analysis Error:', error.message);
    return null;
  }
};

// Fast barcode analysis
export const analyzeBarcode = async (barcode) => {
  console.log('🔍 Analyzing barcode:', barcode);

  // Attempt to fetch from Open Food Facts API first
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
    if (data.status === 1 && data.product) {
      return await formatProductData(data.product, barcode);
    }

    // If API returns no product, fall back to local database if available
    if (localDb[barcode]) {
      console.log('✅ Found in local database (fallback)');
      return await formatProductData(localDb[barcode], barcode, true);
    }

    // Return generic unknown product response
    return {
      product: `Unknown Product (${barcode})`,
      score: 50,
      allergies: [],
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
    // On network error, also try local database before giving up
    if (localDb[barcode]) {
      console.log('✅ Found in local database (error fallback)');
      return await formatProductData(localDb[barcode], barcode, true);
    }
    return {
      product: "Connection Error",
      score: 50,
      allergies: [],
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
  try {
    const results = await searchProducts(productName);
    if (results && results.length > 0) {
      return results[0];
    }
    return await generateAIAnalysis(productName, null);
  } catch (error) {
    return await generateAIAnalysis(productName, null);
  }
};

export const searchProducts = async (rawProductName) => {
  const productName = rawProductName?.trim() || '';
  if (productName.length < 2) return [];
  
  const subdomains = ['world', 'fr']; // Reduced to avoid long waits
  let lastError = null;

  for (const sub of subdomains) {
    try {
      console.log(`🔍 Searching (${sub}) for: "${productName}"...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Using search_terms with simple mode for broadest matching
      const searchUrl = `https://${sub}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1&page_size=10`;

      const response = await fetch(searchUrl, { 
        signal: controller.signal, 
        headers: HEADERS 
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
          console.log(`✅ Found ${data.products.length} matches on ${sub}`);
          
          const processedResults = [];
          for (const p of data.products.slice(0, 10)) {
            try {
              const formatted = await formatProductData(p, productName, true);
              processedResults.push(formatted);
            } catch (err) {
              console.log('⚠️ Formatting error:', err.message);
            }
          }
          return processedResults;
        }
        console.log(`⚠️ No direct matches on ${sub}`);
      } else {
        console.log(`⚠️ Subdomain ${sub} responded with status: ${response.status}`);
      }
    } catch (error) {
      lastError = error.message;
      console.log(`⚠️ ${sub} search error:`, error.message);
    }
  }

  // AI FALLBACK: If API returns nothing, use Gemini to "predict" the most likely product
  console.log('✨ Triggering AI Smart Search fallback for:', productName);
  try {
    const aiSuggestion = await generateAIAnalysis(productName, null);
    if (aiSuggestion) {
      return [{
        ...aiSuggestion,
        product: `${productName} (AI Estimate)`,
        source: 'Gemini AI Prediction'
      }];
    }
  } catch (aiErr) {
    console.log('❌ AI Fallback failed:', aiErr.message);
  }

  return [];
};

const generateHeuristicPredictions = (product, nutrition) => {
  const predictions = [];
  const sugar = parseFloat(nutrition.sugar);
  const fat = parseFloat(nutrition.fat);
  const ingredients = (product.ingredients_text_en || product.ingredients_text || '').toLowerCase();

  if (!isNaN(sugar) && sugar > 18) {
    predictions.push({ disease: 'Type 2 Diabetes', probability: 'High', description: 'Chronic high sugar intake causes insulin resistance.' });
  }
  if (!isNaN(fat) && fat > 25) {
    predictions.push({ disease: 'Metabolic Syndrome', probability: 'High', description: 'High lipid density promotes systemic inflammation.' });
  }
  if (ingredients.includes('nitrite') || ingredients.includes('nitrate')) {
    predictions.push({ disease: 'Colorectal Cancer', probability: 'Moderate', description: 'Processed preservatives are classified carcinogens.' });
  }

  if (predictions.length === 0) {
    predictions.push({ disease: 'Low Chronic Risk', probability: 'Very Low', description: 'No significant disease markers found.' });
  }
  return predictions;
};

const formatProductData = async (product, searchTerm, skipAI = false) => {
  const name = product.product_name || searchTerm;
  const score = product.nutriscore_grade ? scoreToNumber(product.nutriscore_grade) : calculateScore(product);

  const ingredientsText = product.ingredients_text_en || product.ingredients_text || 'Not available';
  
  const nutritionInfo = {
    calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 'N/A',
    protein: product.nutriments?.['proteins_100g'] || 'N/A',
    carbs: product.nutriments?.['carbohydrates_100g'] || 'N/A',
    fat: product.nutriments?.['fat_100g'] || 'N/A',
    sugar: product.nutriments?.['sugars_100g'] || 'N/A',
    salt: product.nutriments?.['salt_100g'] || 'N/A',
  };

  // 🤖 Dynamic AI Analysis for both Predictions AND Allergies
  let aiResult = null;
  if (!skipAI) {
    aiResult = await getGeminiPrediction(name, nutritionInfo, ingredientsText);
  }
  
  // Use AI results if available, otherwise fallback
  const predictions = aiResult?.predictions || generateHeuristicPredictions(product, nutritionInfo);
  
  // Dynamic AI Allergies Fallback
  let finalAllergies = aiResult?.allergies || [];
  if (!aiResult) {
    // Basic heuristic fallback if AI fails
    let allergySource = product.allergens_tags || product.allergens_hierarchy || [];
    if (typeof allergySource === 'string') allergySource = allergySource.split(',');
    finalAllergies = (Array.isArray(allergySource) ? allergySource : [])
      .map(a => typeof a === 'string' ? a.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ').toUpperCase() : String(a))
      .filter(v => v && v.length > 0);
  }

  // Personal Health Profile Warning Checks
  const { getHealthConditions } = require('../../database/sqlite');
  const healthProfile = await getHealthConditions();
  const userConditions = healthProfile ? healthProfile.split(',').map(c => c.trim().toLowerCase()).filter(Boolean) : [];
  
  const nameLower = name.toLowerCase();
  const ingredientsLower = ingredientsText.toLowerCase();
  const warningLabels = [];
  
  // Check nutrition data against health conditions
  const sugar = parseFloat(nutritionInfo.sugar);
  const salt = parseFloat(nutritionInfo.salt);
  const fat = parseFloat(nutritionInfo.fat);
  
  if (userConditions.includes('diabetes') && !isNaN(sugar) && sugar > 15) {
    if (!warningLabels.includes('diabetes')) {
      warningLabels.push('diabetes');
    }
  }
  
  if ((userConditions.includes('hypertension') || userConditions.includes('high blood pressure')) && !isNaN(salt) && salt > 1) {
    if (!warningLabels.includes('high blood pressure')) {
      warningLabels.push('high blood pressure');
    }
  }
  
  if ((userConditions.includes('heart disease') || userConditions.includes('cardiovascular')) && !isNaN(fat) && fat > 20) {
    if (!warningLabels.includes('heart disease')) {
      warningLabels.push('heart disease');
    }
  }
  
  for (const condition of userConditions) {
    if (ingredientsLower.includes(condition) || nameLower.includes(condition)) {
      if (!warningLabels.includes(condition)) {
        warningLabels.push(condition);
      }
      
      const formattedCondition = condition.charAt(0).toUpperCase() + condition.slice(1);
      const isAlreadyInAllergies = finalAllergies.some(
        a => a.toLowerCase() === condition
      );
      if (!isAlreadyInAllergies) {
        finalAllergies.push(formattedCondition);
      }
    }
  }

  return {
    product: name,
    score,
    allergies: finalAllergies,
    warningLabels,
    nutritionInfo,
    predictions,
    brands: product.brands || 'Unknown',
    ingredients: ingredientsText,
    source: aiResult ? 'Gemini AI Analysis' : 'Analytical Heuristics',
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

export const generateAIAnalysis = async (rawProductName, productData) => {
  const productName = rawProductName?.trim() || 'Unknown Product';
  const lower = productName.toLowerCase();

  // Attempt Gemini prediction for manual entry or enriched product data
  const nutritionPlaceholder = productData?.nutritionInfo || { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fat: 'N/A', sugar: 'N/A', salt: 'N/A' };
  const ingredientsText = productData?.ingredients || "Manual search entry";
  const aiResult = await getGeminiPrediction(productName, nutritionPlaceholder, ingredientsText);

  let predictions = aiResult?.predictions;
  let allergies = aiResult?.allergies || productData?.allergies || [];

  // Personal Health Profile Warning Checks (Manual Override/Enrichment)
  const { getHealthConditions } = require('../../database/sqlite');
  const healthProfile = await getHealthConditions();
  const userConditions = healthProfile ? healthProfile.split(',').map(c => c.trim().toLowerCase()).filter(Boolean) : [];
  
  const ingredientsLower = ingredientsText.toLowerCase();
  const nameLower = productName.toLowerCase();
  const warningLabels = productData?.warningLabels || [];
  
  // Check nutrition data against health conditions
  const sugar = parseFloat(nutritionPlaceholder.sugar);
  const salt = parseFloat(nutritionPlaceholder.salt);
  const fat = parseFloat(nutritionPlaceholder.fat);
  
  if (userConditions.includes('diabetes') && !isNaN(sugar) && sugar > 15) {
    if (!warningLabels.includes('diabetes')) {
      warningLabels.push('diabetes');
    }
  }
  
  if ((userConditions.includes('hypertension') || userConditions.includes('high blood pressure')) && !isNaN(salt) && salt > 1) {
    if (!warningLabels.includes('high blood pressure')) {
      warningLabels.push('high blood pressure');
    }
  }
  
  if ((userConditions.includes('heart disease') || userConditions.includes('cardiovascular')) && !isNaN(fat) && fat > 20) {
    if (!warningLabels.includes('heart disease')) {
      warningLabels.push('heart disease');
    }
  }
  
  for (const condition of userConditions) {
    if (ingredientsLower.includes(condition) || nameLower.includes(condition)) {
      if (!warningLabels.includes(condition)) {
        warningLabels.push(condition);
      }
      
      const formattedCondition = condition.charAt(0).toUpperCase() + condition.slice(1);
      const isAlreadyInAllergies = allergies.some(a => a.toLowerCase() === condition);
      if (!isAlreadyInAllergies) {
        allergies.push(formattedCondition);
      }
    }
  }

  if (!predictions) {
    // Basic fallback logic
    predictions = productData?.predictions || [{ disease: 'General Risk', probability: 'Moderate', description: 'Inconclusive data, consume in moderation.' }];
    if (lower.includes('soda')) predictions = [{ disease: 'Type 2 Diabetes', probability: 'High', description: 'Continuous exposure to liquid sugars.' }];
  }

  return {
    product: productName,
    score: productData?.score || 50,
    allergies,
    warningLabels,
    nutritionInfo: nutritionPlaceholder,
    predictions,
    brands: productData?.brands || 'Unknown',
    ingredients: ingredientsText,
    source: aiResult ? 'Gemini AI Analysis' : (productData ? productData.source : 'AI Analysis'),
    imageUrl: productData?.imageUrl || null
  };
};

