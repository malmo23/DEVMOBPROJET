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
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 FoodRisk-App/1.0',
  'Accept': 'application/json'
};

// Gemini Prediction Logic
const getGeminiPrediction = async (productName, nutrition, ingredients) => {
  if (!genAI) return null;

  try {
    let healthProfile = '';
    try {
      const { getHealthConditionsCloud } = require('./foodService');
      healthProfile = await getHealthConditionsCloud();
    } catch (_) {}
    if (!healthProfile) {
      const { getHealthConditions } = require('../../database/sqlite');
      healthProfile = await getHealthConditions();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
You are a clinical nutritionist and medical expert. Analyze this food product for long-term chronic consumption health risks.

PRODUCT: "${productName}"
NUTRITION (per 100g): ${JSON.stringify(nutrition)}
INGREDIENTS: ${ingredients}
${healthProfile ? `\nUSER HEALTH PROFILE: ${healthProfile}\nIMPORTANT: Flag any risks especially dangerous for these specific conditions with extra severity.` : ""}

Provide a detailed analysis with exactly 4 long-term health risk predictions based on SCIENTIFIC EVIDENCE of chronic consumption.

For each risk, provide:
- A specific disease or condition name (e.g. "Type 2 Diabetes", "Colorectal Cancer", "Hypertension", "Non-Alcoholic Fatty Liver Disease")
- Probability level: "High", "Moderate", or "Low" — based on the actual nutritional values
- A 2-sentence medical explanation citing the specific ingredient or nutrient responsible
- A timeframe of risk (e.g. "5-10 years", "10+ years", "2-5 years")
- An impact score 1-10 (10 = most severe)

Also identify all allergens in the ingredients.

Return ONLY valid JSON in this exact format, no markdown:
{
  "predictions": [
    {
      "disease": "Disease Name",
      "probability": "High",
      "description": "Two sentence scientific explanation of the risk.",
      "timeframe": "5-10 years",
      "impact": 8,
      "nutrientCause": "Sugar / Palm Oil / Sodium / etc"
    }
  ],
  "allergies": ["ALLERGY1", "ALLERGY2"]
}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
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
    console.log('✅ Found in local database, enriching with health profile...');
    const local = localDb[barcode];
    const syntheticProduct = {
      product_name: local.product,
      nutriscore_grade: null,
      nutriments: {
        'energy-kcal_100g': local.nutritionInfo?.calories,
        proteins_100g: local.nutritionInfo?.protein,
        carbohydrates_100g: local.nutritionInfo?.carbs,
        fat_100g: local.nutritionInfo?.fat,
        sugars_100g: local.nutritionInfo?.sugar,
        salt_100g: local.nutritionInfo?.salt,
      },
      allergens_tags: local.allergies || [],
      ingredients_text: local.ingredients || '',
      image_url: local.imageUrl || null,
      brands: local.brands || '',
    };
    return await formatProductData(syntheticProduct, barcode);
  }

  const tryFetch = async (url) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: HEADERS });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      console.log('Fetch error for', url, e.message);
      return null;
    }
  };

  try {
    // Try v2 first (more up-to-date), fall back to v0
    let data = await tryFetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,nutriscore_grade,nutriments,allergens_tags,allergens_hierarchy,ingredients_text,ingredients_text_en,image_url,brands`);
    
    if (!data || data.status !== 1 || !data.product) {
      console.log('v2 miss, trying v0...');
      data = await tryFetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    }

    if (data && data.status === 1 && data.product) {
      console.log('✅ Product found:', data.product.product_name);
      return await formatProductData(data.product, barcode);
    }

    console.log('❌ Barcode not found in any database:', barcode);
    const notFoundErr = new Error('BARCODE_NOT_FOUND');
    notFoundErr.notFound = true;
    notFoundErr.barcode = barcode;
    throw notFoundErr;

  } catch (error) {
    if (error.notFound) throw error;
    console.log('Barcode API Error:', error);
    const netErr = new Error('NETWORK_ERROR');
    netErr.networkError = true;
    netErr.message = error.message;
    throw netErr;
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
  const salt = parseFloat(nutrition.salt);
  const calories = parseFloat(nutrition.calories);
  const ingredients = (product.ingredients_text_en || product.ingredients_text || '').toLowerCase();

  if (!isNaN(sugar) && sugar > 18) {
    predictions.push({
      disease: 'Type 2 Diabetes',
      probability: sugar > 30 ? 'High' : 'Moderate',
      description: `High sugar content (${sugar}g/100g) causes repeated insulin spikes, leading to insulin resistance over time. Chronic intake raises HbA1c levels and significantly increases diabetes risk.`,
      timeframe: sugar > 30 ? '5-10 years' : '10+ years',
      impact: sugar > 30 ? 8 : 6,
      nutrientCause: 'Sugar'
    });
  }

  if (!isNaN(sugar) && sugar > 10) {
    predictions.push({
      disease: 'Dental Caries & Oral Disease',
      probability: 'High',
      description: `Sugar content of ${sugar}g/100g feeds oral bacteria that produce enamel-eroding acids. Regular consumption accelerates tooth decay and gum disease progression.`,
      timeframe: '1-3 years',
      impact: 5,
      nutrientCause: 'Sugar'
    });
  }

  if (!isNaN(fat) && fat > 20) {
    predictions.push({
      disease: 'Cardiovascular Disease',
      probability: fat > 30 ? 'High' : 'Moderate',
      description: `Fat content of ${fat}g/100g elevates LDL cholesterol and promotes arterial plaque buildup. Chronic consumption increases risk of heart attack and stroke significantly.`,
      timeframe: '10+ years',
      impact: fat > 30 ? 9 : 7,
      nutrientCause: 'Saturated Fat'
    });
  }

  if (!isNaN(fat) && fat > 15) {
    predictions.push({
      disease: 'Non-Alcoholic Fatty Liver Disease',
      probability: 'Moderate',
      description: `Excess fat (${fat}g/100g) and sugar overload the liver's metabolic capacity, leading to fat accumulation. This can progress to liver inflammation and fibrosis without symptoms.`,
      timeframe: '5-15 years',
      impact: 7,
      nutrientCause: 'Fat & Sugar'
    });
  }

  if (!isNaN(salt) && salt > 1.5) {
    predictions.push({
      disease: 'Hypertension',
      probability: salt > 2.5 ? 'High' : 'Moderate',
      description: `Sodium content (${salt}g/100g) causes water retention and increases blood vessel pressure. Sustained high intake raises systolic blood pressure and risk of stroke by up to 40%.`,
      timeframe: '3-8 years',
      impact: 8,
      nutrientCause: 'Sodium'
    });
  }

  if (ingredients.includes('nitrite') || ingredients.includes('nitrate') || ingredients.includes('e250') || ingredients.includes('e251')) {
    predictions.push({
      disease: 'Colorectal Cancer',
      probability: 'Moderate',
      description: 'Nitrites and nitrates are classified as Group 2A carcinogens by the IARC. They form N-nitroso compounds in the gut that damage DNA and can trigger colorectal tumor growth over decades.',
      timeframe: '15-20 years',
      impact: 8,
      nutrientCause: 'Nitrites / Nitrates'
    });
  }

  if (ingredients.includes('palm oil') || ingredients.includes('huile de palme')) {
    predictions.push({
      disease: 'Metabolic Syndrome',
      probability: 'Moderate',
      description: 'Palm oil is high in saturated palmitic acid, which triggers systemic inflammation and insulin resistance. Chronic intake is linked to obesity, dyslipidemia, and elevated cardiovascular risk.',
      timeframe: '5-10 years',
      impact: 7,
      nutrientCause: 'Palm Oil'
    });
  }

  if (ingredients.includes('aspartame') || ingredients.includes('acesulfame') || ingredients.includes('sucralose')) {
    predictions.push({
      disease: 'Gut Microbiome Disruption',
      probability: 'Moderate',
      description: 'Artificial sweeteners alter gut microbiota composition and reduce beneficial bacteria diversity. Emerging research links chronic intake to glucose intolerance and metabolic dysregulation.',
      timeframe: '2-5 years',
      impact: 5,
      nutrientCause: 'Artificial Sweeteners'
    });
  }

  if (!isNaN(calories) && calories > 450) {
    predictions.push({
      disease: 'Obesity',
      probability: 'High',
      description: `Very high caloric density (${calories} kcal/100g) promotes caloric surplus with regular consumption. Sustained excess calories lead to adipose tissue accumulation and metabolic complications.`,
      timeframe: '2-5 years',
      impact: 7,
      nutrientCause: 'High Caloric Density'
    });
  }

  if (predictions.length === 0) {
    predictions.push({
      disease: 'Low Chronic Risk',
      probability: 'Low',
      description: 'No significant disease risk markers detected in this product\'s nutritional profile. Moderate consumption as part of a balanced diet appears relatively safe.',
      timeframe: 'N/A',
      impact: 2,
      nutrientCause: 'None identified'
    });
  }

  return predictions.slice(0, 4);
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

  // Personal Health Profile Warning Checks (cloud-first, local fallback)
  let healthProfile = '';
  try {
    const { getHealthConditionsCloud } = require('./foodService');
    healthProfile = await getHealthConditionsCloud();
  } catch (_) {}
  if (!healthProfile) {
    const { getHealthConditions } = require('../../database/sqlite');
    healthProfile = await getHealthConditions();
  }
  const userConditions = healthProfile ? healthProfile.split(',').map(c => c.trim().toLowerCase()).filter(Boolean) : [];

  const nameLower = name.toLowerCase();
  const ingredientsLower = ingredientsText.toLowerCase();
  const warningLabels = [];

  const sugar = parseFloat(nutritionInfo.sugar);
  const salt = parseFloat(nutritionInfo.salt);
  const fat = parseFloat(nutritionInfo.fat);

  if (userConditions.includes('diabetes') && !isNaN(sugar) && sugar > 10) {
    if (!warningLabels.includes('Diabetes')) warningLabels.push('Diabetes');
  }
  if ((userConditions.includes('hypertension') || userConditions.includes('high blood pressure')) && !isNaN(salt) && salt > 1) {
    if (!warningLabels.includes('Hypertension')) warningLabels.push('Hypertension');
  }
  if ((userConditions.includes('heart disease') || userConditions.includes('cardiovascular')) && !isNaN(fat) && fat > 15) {
    if (!warningLabels.includes('Heart Disease')) warningLabels.push('Heart Disease');
  }
  if ((userConditions.includes('obesity') || userConditions.includes('overweight')) && !isNaN(parseFloat(nutritionInfo.calories)) && parseFloat(nutritionInfo.calories) > 400) {
    if (!warningLabels.includes('Obesity Risk')) warningLabels.push('Obesity Risk');
  }

  for (const condition of userConditions) {
    if (ingredientsLower.includes(condition) || nameLower.includes(condition)) {
      const label = condition.charAt(0).toUpperCase() + condition.slice(1);
      if (!warningLabels.includes(label)) warningLabels.push(label);
    }
    // allergy match in allergens
    const allergenMatch = finalAllergies.some(a => a.toLowerCase().includes(condition));
    if (allergenMatch) {
      const label = condition.charAt(0).toUpperCase() + condition.slice(1);
      if (!warningLabels.includes(label)) warningLabels.push(label);
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

  if (!predictions) {
    predictions = productData?.predictions || [{ disease: 'General Risk', probability: 'Moderate', description: 'Inconclusive data, consume in moderation.', timeframe: 'N/A', impact: 4, nutrientCause: 'Unknown' }];
    if (lower.includes('soda')) predictions = [{ disease: 'Type 2 Diabetes', probability: 'High', description: 'Continuous exposure to liquid sugars raises insulin resistance significantly.', timeframe: '5-10 years', impact: 8, nutrientCause: 'Sugar' }];
  }

  // Personal Health Profile Warning Checks (cloud-first, local fallback)
  let healthProfile = '';
  try {
    const { getHealthConditionsCloud } = require('./foodService');
    healthProfile = await getHealthConditionsCloud();
  } catch (_) {}
  if (!healthProfile) {
    const { getHealthConditions } = require('../../database/sqlite');
    healthProfile = await getHealthConditions();
  }
  const userConditions = healthProfile ? healthProfile.split(',').map(c => c.trim().toLowerCase()).filter(Boolean) : [];

  const ingredientsLower = ingredientsText.toLowerCase();
  const nameLower = productName.toLowerCase();
  const warningLabels = productData?.warningLabels || [];

  const sugar = parseFloat(nutritionPlaceholder.sugar);
  const salt = parseFloat(nutritionPlaceholder.salt);
  const fat = parseFloat(nutritionPlaceholder.fat);

  if (userConditions.includes('diabetes') && !isNaN(sugar) && sugar > 10) {
    if (!warningLabels.includes('Diabetes')) warningLabels.push('Diabetes');
  }
  if ((userConditions.includes('hypertension') || userConditions.includes('high blood pressure')) && !isNaN(salt) && salt > 1) {
    if (!warningLabels.includes('Hypertension')) warningLabels.push('Hypertension');
  }
  if ((userConditions.includes('heart disease') || userConditions.includes('cardiovascular')) && !isNaN(fat) && fat > 15) {
    if (!warningLabels.includes('Heart Disease')) warningLabels.push('Heart Disease');
  }
  if ((userConditions.includes('obesity') || userConditions.includes('overweight')) && !isNaN(parseFloat(nutritionPlaceholder.calories)) && parseFloat(nutritionPlaceholder.calories) > 400) {
    if (!warningLabels.includes('Obesity Risk')) warningLabels.push('Obesity Risk');
  }

  for (const condition of userConditions) {
    if (ingredientsLower.includes(condition) || nameLower.includes(condition)) {
      const label = condition.charAt(0).toUpperCase() + condition.slice(1);
      if (!warningLabels.includes(label)) warningLabels.push(label);
    }
    const allergenMatch = allergies.some(a => a.toLowerCase().includes(condition));
    if (allergenMatch) {
      const label = condition.charAt(0).toUpperCase() + condition.slice(1);
      if (!warningLabels.includes(label)) warningLabels.push(label);
    }
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

