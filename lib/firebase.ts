// lib/firebase.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Platform } from 'react-native';

import {
  browserLocalPersistence,
  // Web auth imports
  getAuth as getWebAuth,
  GoogleAuthProvider,
  setPersistence,
  type Auth,
} from 'firebase/auth';

import {
  getReactNativePersistence,
  // React Native auth entrypoint
  initializeAuth,
} from 'firebase/auth/react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- Config (Expo: EXPO_PUBLIC_* is required for client-side access) ----
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
};

// ---- Singleton app ----
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ---- Global guard to initialize Auth only once per runtime ----
declare global {
   
  var __FIREBASE_AUTH__: Auth | undefined;
}

if (!globalThis.__FIREBASE_AUTH__) {
  if (Platform.OS === 'web') {
    const auth = getWebAuth(app);
    void setPersistence(auth, browserLocalPersistence);
    globalThis.__FIREBASE_AUTH__ = auth;
  } else {
    globalThis.__FIREBASE_AUTH__ = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
}

// ---- Exports ----
export const auth = globalThis.__FIREBASE_AUTH__!;
export const googleProvider = new GoogleAuthProvider();
