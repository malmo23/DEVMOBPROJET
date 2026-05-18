import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Check if we're on web
const isWeb = Platform.OS === 'web';

// Initialize database (mobile only)
let db = null;
if (!isWeb) {
  db = SQLite.openDatabaseSync('foodrisk.db');
}

// Web storage alternative
const webStorage = {
  foods: [],
};

export const initDB = async () => {
  if (isWeb) {
    console.log('⚠️ Using web storage (SQLite not available on web)');
    // Load from localStorage if available
    const stored = localStorage.getItem('foodrisk_data');
    if (stored) {
      webStorage.foods = JSON.parse(stored);
    }
    return;
  }

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        riskLevel TEXT,

        allergies TEXT,

        allergens TEXT,

        expiryDate TEXT,
        category TEXT,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );    

    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
};


export const saveHealthConditions = async (conditions) => {
  if (isWeb) {
    localStorage.setItem('health_conditions', conditions);
    return;
  }
  try {
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);', ['health_conditions', conditions]);
  } catch (error) {
    console.error('❌ Error saving conditions:', error);
  }
};

export const getHealthConditions = async () => {
  if (isWeb) {
    return localStorage.getItem('health_conditions') || '';
  }
  try {
    const row = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?;', ['health_conditions']);
    return row ? row.value : '';
  } catch (error) {
    console.error('❌ Error getting conditions:', error);
    return '';
  }
};



export const getAllFoods = async () => {
  if (isWeb) {
    return webStorage.foods;
  }

  try {
    const rows = await db.getAllAsync('SELECT * FROM foods ORDER BY createdAt DESC;');
    return rows;
  } catch (error) {
    console.error('❌ Error getting foods:', error);
    return [];
  }
};

export const addFood = async (foodData) => {
  if (isWeb) {
    const newFood = {
      id: Date.now(),
      ...foodData,
      createdAt: new Date().toISOString(),
    };
    webStorage.foods.unshift(newFood);
    localStorage.setItem('foodrisk_data', JSON.stringify(webStorage.foods));
    console.log('✅ Food added (web storage)');
    return;
  }

  try {
    const { name, riskLevel, allergies, expiryDate, category, notes } = foodData;
    await db.runAsync(
      'INSERT INTO foods (name, riskLevel, allergies, expiryDate, category, notes) VALUES (?, ?, ?, ?, ?, ?);',
      [name, riskLevel, allergies, expiryDate, category, notes]
    );
    console.log('✅ Food added');
  } catch (error) {
    console.error('❌ Error adding food:', error);
  }
};

export const deleteFood = async (id) => {
  if (isWeb) {
    webStorage.foods = webStorage.foods.filter(food => food.id !== id);
    localStorage.setItem('foodrisk_data', JSON.stringify(webStorage.foods));
    console.log('✅ Food deleted (web storage)');
    return;
  }

  try {
    await db.runAsync('DELETE FROM foods WHERE id = ?;', [id]);
    console.log('✅ Food deleted');
  } catch (error) {
    console.error('❌ Error deleting food:', error);
  }
};