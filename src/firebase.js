import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAm3H9dyV7YGniAelRxKZ5V5LJFihUU4fQ",
  authDomain: "azuba-finance.firebaseapp.com",
  projectId: "azuba-finance",
  storageBucket: "azuba-finance.firebasestorage.app",
  messagingSenderId: "236798361841",
  appId: "1:236798361841:web:131bab8743df6e103b6950"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // Yeh zaroori hai