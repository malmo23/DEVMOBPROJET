import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your API key from https://aistudio.google.com/
const GEMINI_API_KEY = "AIzaSyB-U4qOJgOi7fgIwX46SkCIFUWlXjl2BZ0";
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
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Content-Type': 'application/json'
};

// Gemini Prediction Logic
const getGeminiPrediction = async (productName, nutrition, ingredients) => {
  if (!genAI) return null;

  try {
    // Using gemini-2.0-flash which is the stable standard
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Analyze this food product: "${productName}"
      Nutrition (per 100g): ${JSON.stringify(nutrition)}
      Ingredients: ${ingredients}

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
    if (data.status === 1 && data.product) {
      return await formatProductData(data.product, barcode);
    }

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
    return localDb[barcode] || {
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

export const searchProducts = async (productName) => {
  const subdomains = ['world', 'fr', 'en', 'us'];
  let lastError = null;

  for (const sub of subdomains) {
    try {
      console.log(`🔍 Searching (${sub})...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const searchUrl = `https://${sub}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1&page_size=10`;

      const response = await fetch(searchUrl, { signal: controller.signal, headers: HEADERS });
      
      if (response.ok) {
        const data = await response.json();
        if (!data.products || data.products.length === 0) {
          console.log(`⚠️ No results on ${sub}, trying next...`);
          clearTimeout(timeoutId);
          continue;
        }

        console.log(`✅ Results found on ${sub}: ${data.products.length}`);
        
        // Process results sequentially to avoid hitting free-tier rate limits
        const processedResults = [];
        for (const p of data.products.slice(0, 10)) { // Limit to top 10 for speed
          try {
            const formatted = await formatProductData(p, productName);
            processedResults.push(formatted);
            // Larger delay to respect Gemini free-tier rate limits
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (err) {
            console.log('⚠️ Error formatting product:', err.message);
          }
        }
        
        return processedResults;
      } else {
        console.log(`⚠️ Subdomain ${sub} failed: ${response.status}`);
      }
      clearTimeout(timeoutId);
    } catch (error) {
      lastError = error.message;
      console.log(`⚠️ ${sub} error:`, error.message);
    }
  }

  console.log('❌ All search attempts failed:', lastError);
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

const formatProductData = async (product, searchTerm) => {
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
  const aiResult = await getGeminiPrediction(name, nutritionInfo, ingredientsText);
  
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

  return {
    product: name,
    score,
    allergies: finalAllergies,
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

export const generateAIAnalysis = async (productName, productData) => {
  const lower = productName.toLowerCase();

  // Attempt Gemini prediction for manual entry
  const nutritionPlaceholder = { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fat: 'N/A', sugar: 'N/A', salt: 'N/A' };
  const aiResult = await getGeminiPrediction(productName, nutritionPlaceholder, "Manual search entry");

  let predictions = aiResult?.predictions;
  let allergies = aiResult?.allergies || [];

  if (!predictions) {
    // Basic fallback logic
    predictions = [{ disease: 'General Risk', probability: 'Moderate', description: 'Inconclusive data, consume in moderation.' }];
    if (lower.includes('soda')) predictions = [{ disease: 'Type 2 Diabetes', probability: 'High', description: 'Continuous exposure to liquid sugars.' }];
  }

  return {
    product: productName,
    score: 50,
    allergies,
    nutritionInfo: nutritionPlaceholder,
    predictions,
    ingredients: 'Not available (AI estimation)',
    source: 'AI Analysis',
    imageUrl: null
  };
};

