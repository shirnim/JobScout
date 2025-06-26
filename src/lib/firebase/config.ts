
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
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let isFirebaseConfigured = false;

// Check that config values are not placeholders and are present
if (
    firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your-') &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        isFirebaseConfigured = true;
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error(
            "Firebase initialization failed! Please check your credentials in .env.",
            error
        );
        app = null;
        isFirebaseConfigured = false;
    }
} else {
    console.warn(
        'Firebase is not configured. The app will not function correctly without credentials. Please add your Firebase project credentials to the .env file.'
    );
}

// Lazy-load and cache the auth and firestore instances
const getFirebaseAuth = (): Auth | null => {
    if (!isFirebaseConfigured || !app) {
        return null;
    }
    if (!authInstance) {
        authInstance = getAuth(app);
    }
    return authInstance;
};

const getFirebaseDb = (): Firestore | null => {
    if (!isFirebaseConfigured || !app) {
        return null;
    }
    if (!dbInstance) {
        dbInstance = getFirestore(app);
    }
    return dbInstance;
};


export { app, getFirebaseAuth, getFirebaseDb, isFirebaseConfigured };
