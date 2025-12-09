import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as Auth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For the purpose of this "Speed Run" and without actual API keys from the user,
// we will mock the config or rely on them filling it in.
// Ideally, these come from process.env.EXPO_PUBLIC_...
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
const auth = Auth.initializeAuth(app, {
  persistence: (Auth as any).getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
