// lib/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';
import { Platform } from 'react-native';

// ---- Config from Expo public env ----
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Try to load getReactNativePersistence from either path (version-safe)
let getRNPersistence: ((storage: any) => any) | undefined;
try {
  // @ts-ignore – some setups only expose this subpath
  ({ getReactNativePersistence: getRNPersistence } = require('firebase/auth/react-native'));
} catch {}
if (!getRNPersistence) {
  try {
    // @ts-ignore – some versions re-export from 'firebase/auth'
    ({ getReactNativePersistence: getRNPersistence } = require('firebase/auth'));
  } catch {}
}

let auth: Auth;

if (Platform.OS === 'web') {
  // Web: normal getAuth + persisted sessions
  const webAuth = getAuth(app);
  setPersistence(webAuth, browserLocalPersistence);
  auth = webAuth;
} else {
  // Native: must call initializeAuth BEFORE anyone calls getAuth
  if (typeof getRNPersistence === 'function') {
    auth = initializeAuth(app, {
      persistence: getRNPersistence(AsyncStorage),
    });
  } else {
    console.warn('[firebase] getReactNativePersistence not available; using non-persistent auth.');
    auth = initializeAuth(app);
  }
}

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
