// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlqNGn_Q2A-9vSM95O7pmtQgw-tBMudB8",
  authDomain: "driftenterprises-official.firebaseapp.com",
  databaseURL: "https://driftenterprises-official-default-rtdb.firebaseio.com",
  projectId: "driftenterprises-official",
  storageBucket: "driftenterprises-official.firebasestorage.app",
  messagingSenderId: "103758286150",
  appId: "1:103758286150:web:957bdd5eba9f20198ca947",
  measurementId: "G-4PT26S55P3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, analytics, auth, database, storage };
