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

// Try to resolve getReactNativePersistence in a version-safe way
let getRNPersistence: ((storage: unknown) => unknown) | undefined;
try {
  // @ts-ignore some setups expose this subpath
  ({ getReactNativePersistence: getRNPersistence } = require('firebase/auth/react-native'));
} catch {}
if (!getRNPersistence) {
  try {
    // @ts-ignore some versions re-export from 'firebase/auth'
    ({ getReactNativePersistence: getRNPersistence } = require('firebase/auth'));
  } catch {}
}

let auth: Auth;

if (Platform.OS === 'web') {
  // Web: standard getAuth + persistence
  const webAuth = getAuth(app);
  // it's okay to not await; auth will persist sessions
  setPersistence(webAuth, browserLocalPersistence);
  auth = webAuth;
} else {
  // Native: first try to reuse an existing instance (if initialized elsewhere),
  // otherwise initialize with AsyncStorage persistence.
  try {
    auth = getAuth(app);
  } catch {
    if (typeof getRNPersistence === 'function') {
      auth = initializeAuth(app, {
        persistence: getRNPersistence(AsyncStorage),
      });
    } else {
      console.warn(
        '[firebase] getReactNativePersistence not available; falling back to non-persistent native auth.'
      );
      auth = initializeAuth(app);
    }
  }
}

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
