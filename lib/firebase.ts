import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  setPersistence,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Try to resolve getReactNativePersistence in a version-safe way
let getRNPersistence: ((storage: unknown) => Persistence) | undefined;
try {
  // @ts-ignore – some setups expose this subpath
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
  const webAuth = getAuth(app);
  setPersistence(webAuth, browserLocalPersistence);
  auth = webAuth;
} else {
  // Reuse if already initialized; otherwise initialize with persistence
  try {
    auth = getAuth(app);
  } catch {
    if (typeof getRNPersistence === 'function') {
      const rnPersistence = getRNPersistence(AsyncStorage) as Persistence;
      auth = initializeAuth(app, { persistence: rnPersistence });
    } else {
      console.warn('[firebase] RN persistence not available; using non-persistent native auth.');
      auth = initializeAuth(app);
    }
  }
}

const googleProvider = new GoogleAuthProvider();
export { auth, googleProvider };
