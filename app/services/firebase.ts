// app/services/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { Platform } from 'react-native';

// ✅ Config from your .env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Auth instance with proper persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
