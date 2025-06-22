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

// A robust check to ensure Firebase is configured with actual credentials, not placeholders.
const hasValidConfig = 
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your-') && 
  !firebaseConfig.authDomain.includes('your-') &&
  !firebaseConfig.projectId.includes('your-');

if (hasValidConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization failed despite configuration being present. Check your .env values.", e);
    // Reset to null if initialization fails for any reason
    app = null;
    auth = null;
    db = null;
  }
} else {
    console.warn(
        'Firebase is not configured with valid credentials. App is running in mock mode. Please open the .env file and add your project credentials.'
    );
}

// The single source of truth for whether Firebase is ready.
const isFirebaseConfigured = !!auth;

export { app, auth, db, isFirebaseConfigured };
