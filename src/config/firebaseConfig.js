import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA-sEaKNWCGiGJyK0sVEJzjsKWrmHijOqQ",
    authDomain: "foodriskapp.firebaseapp.com",
    projectId: "foodriskapp",
    storageBucket: "foodriskapp.firebasestorage.app",
    messagingSenderId: "427962586808",
    appId: "1:427962586808:web:c543d2923052d33466064d",
    measurementId: "G-P49C4166F2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with Persistence (Platform specific)
const auth = initializeAuth(app, {
    persistence: Platform.OS === 'web'
        ? [indexedDBLocalPersistence, browserLocalPersistence]
        : getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
