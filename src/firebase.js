import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzzfI4FXfenQp2CTA4FBH7L1RGcI0b4hE",
  authDomain: "lettersync-12.firebaseapp.com",
  projectId: "lettersync-12",
  storageBucket: "lettersync-12.firebasestorage.app",
  messagingSenderId: "257775226772",
  appId: "1:257775226772:web:58df6f75746064c5f5c981"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
export const auth = getAuth();
export const db = getFirestore();