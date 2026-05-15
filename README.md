# 🥗 FoodRisk App

**FoodRisk** — AI-powered food safety analysis at your fingertips.

> Scan any food product barcode and instantly get a personalized health risk score, allergen warnings, nutritional breakdown, and AI-generated insights — tailored to your specific health conditions.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 **Barcode Scanner** | Scan any EAN/UPC barcode using your camera for instant product analysis |
| ⌨️ **Manual Entry** | Type or paste a barcode manually if scanning isn't available |
| 🔍 **Product Search** | Search by product name and browse results from the Open Food Facts database |
| 🤖 **AI Analysis** | Gemini AI generates detailed health risk assessments for any product |
| 🕒 **History** | All your scanned products are saved locally with scores and dates |
| 👤 **Profile & Health Conditions** | Set your allergies and health conditions for personalized warnings |
| 🌍 **Multilingual** | Full English / French support with RTL-aware layouts |
| 🔐 **Firebase Auth** | Secure sign-up, login, email verification, and password reset |

---

## 📱 Screenshots

> App uses a dark green gradient theme with bottom tab navigation and a slide-out drawer.

| Home | Scanner | Result | Profile |
|---|---|---|---|
| History of scanned products | Live barcode camera | Risk score + nutrition | Health conditions & account |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Expo Go](https://expo.dev/go) app on your Android or iOS device (for testing)
- A Firebase project (free tier is sufficient)
- A Google Gemini API key (free tier available)

---

### 1. Clone the repository

```bash
git clone https://github.com/malmo23/DEVMOBPROJET.git
cd DEVMOBPROJET
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and set the following values:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

#### Getting your Firebase credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Add a **Web app** to your project
4. Copy the config values from the SDK setup page
5. Enable **Authentication → Email/Password** sign-in method
6. Enable **Firestore Database** (for cloud health condition sync)

#### Getting your Gemini API key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key (free tier: 15 requests/min)
3. Paste it as `EXPO_PUBLIC_GEMINI_API_KEY`

---

### 4. Start the development server

```bash
npx expo start -c
```

Then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan the QR code with **Expo Go** on your physical device

---

## 🏗️ Project Structure

```
FoodRisk-App/
├── App.js                  # Root component — NavigationContainer + LanguageProvider
├── index.js                # Expo entry point
├── app.json                # Expo config (name, icons, permissions)
├── assets/                 # App icons and splash screen
├── database/
│   └── sqlite.js           # Local SQLite database (food history)
└── src/
    ├── components/
    │   ├── Button.js        # Reusable button component
    │   ├── CopyableText.js  # Long-press to copy text
    │   └── ScannerView.js   # Camera barcode scanner view
    ├── config/
    │   └── firebaseConfig.js
    ├── i18n/
    │   ├── LanguageContext.js   # Language toggle context (EN/FR)
    │   └── translations.js      # String translations
    ├── navigation/
    │   └── RootNavigator.js     # Drawer → Bottom Tabs → Stack navigator
    ├── screens/
    │   ├── WelcomeScreen.js     # Dashboard / feature cards
    │   ├── ScannerScreen.js     # Live camera barcode scanner
    │   ├── ManualEntryScreen.js # Manual barcode input
    │   ├── ProductSearchScreen.js # Search by name
    │   ├── ResultScreen.js      # Analysis result with score ring
    │   ├── HomeScreen.js        # Scan history
    │   ├── ProfileScreen.js     # User profile & health conditions
    │   ├── LoginScreen.js       # Authentication
    │   └── RegisterScreen.js    # Registration
    ├── services/
    │   ├── scannerService.js    # Barcode lookup + AI analysis logic
    │   └── foodService.js       # SQLite + Firestore CRUD
    └── theme.js                 # Colors, typography, spacing tokens
```

---

## 🧠 How It Works

```
User scans barcode (camera / manual / search)
        ↓
scannerService fetches product from Open Food Facts API
        ↓
If found → parse nutrition, ingredients, allergens
If not found → Gemini AI generates health risk estimate
        ↓
Cross-reference user's health conditions (from Firestore profile)
        ↓
Generate risk score (0–100) + allergy warnings + health alerts
        ↓
Display result with animated score ring, nutrition cards, allergen chips
        ↓
User can save to local SQLite history → viewable in History tab
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.81 + Expo SDK 54 |
| **Navigation** | React Navigation v7 (Bottom Tabs + Drawer + Native Stack) |
| **Auth & Cloud** | Firebase v12 (Auth + Firestore) |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **Local DB** | Expo SQLite v16 |
| **Icons** | `@expo/vector-icons` — Ionicons |
| **Animations** | React Native Reanimated v4 |
| **Gradients** | `expo-linear-gradient` |
| **Food Data** | Open Food Facts REST API |
| **i18n** | Custom context — English / French |

---

## 📦 Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Start on Android
npm run ios        # Start on iOS
npm run web        # Start on Web (limited features)
```

---

## ⚠️ Known Limitations

- **Camera scanning** requires a physical device — emulators don't support camera access
- **AI analysis** quality depends on Gemini API response; results are estimates, not medical advice
- **Offline mode** — product lookup requires internet; history browsing works offline
- **Web platform** — barcode scanner is not supported on web

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT © [malmo23](https://github.com/malmo23)

---

> **Disclaimer:** FoodRisk provides health risk estimates for informational purposes only. It is not a substitute for professional medical or dietary advice. Always consult a qualified healthcare professional regarding food allergies or health conditions.
