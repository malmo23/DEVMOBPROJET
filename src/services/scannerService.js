const db = {
  "3017620422003": { product: "Nutella 400g", score: 38, allergens: ["Hazelnuts","Milk","Soy"], risks: ["Very high sugar","Palm oil","Additives"], cancerRisk: "Moderate (palm oil)" },
  "5449000000996": { product: "Coca-Cola", score: 12, allergens: [], risks: ["73g sugar","Phosphoric acid"], cancerRisk: "High with regular use" },
};

export const analyzeBarcode = async (barcode) => {
  await new Promise(r => setTimeout(r, 1200));
  return db[barcode] || { product: "Unknown product", score: 65, allergens: [], risks: ["No data"], cancerRisk: "Not classified" };
};

export { analyzeBarcode };