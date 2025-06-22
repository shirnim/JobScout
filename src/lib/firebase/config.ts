
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Only initialize Firebase if explicitly told to in the .env file.
const useRealFirebase = process.env.USE_REAL_FIREBASE === 'true';

if (useRealFirebase) {
  try {
    // Check that config values are not placeholders
    if (firebaseConfig.apiKey?.includes('your-')) {
        throw new Error("Firebase API Key is a placeholder.");
    }
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error(
        "Firebase initialization failed! Please check your credentials in .env and ensure USE_REAL_FIREBASE is set correctly.",
        error
    );
    // Force back to null if anything goes wrong.
    app = null;
    auth = null;
    db = null;
  }
} else {
    console.warn(
        'Firebase is not configured to run. App is in mock mode. To enable, set USE_REAL_FIREBASE="true" in the .env file after adding your credentials.'
    );
}

const isFirebaseConfigured = !!auth;

export { app, auth, db, isFirebaseConfigured, useRealFirebase };
