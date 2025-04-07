// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Log initialization to confirm it's working
console.log("Firebase initialized with project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Create a mock firestore implementation using localStorage as fallback
export const localDb = {
  getPortfolio: (userId) => {
    try {
      const data = localStorage.getItem(`portfolio_${userId}`);
      return data ? JSON.parse(data) : { coins: [] };
    } catch (error) {
      console.error("Error getting data from localStorage:", error);
      return { coins: [] };
    }
  },
  
  savePortfolio: (userId, data) => {
    try {
      localStorage.setItem(`portfolio_${userId}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      return false;
    }
  }
};

export { db, auth };
export default app; 