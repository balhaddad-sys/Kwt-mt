import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Firebase configuration
// KWT-MT (Kuwaiti Student Association in Malta)
// Project ID: kwt-mt
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAMiL3f5uie0io5hsHBiHhHIq2q5Vv-WbA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kwt-mt.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kwt-mt',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kwt-mt.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '253960446965',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:253960446965:web:66836ed17301968f6436bc',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-HL4CMV5MKC',
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize Analytics only in browser environment
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { app, auth, db, storage, analytics };
export default app;
