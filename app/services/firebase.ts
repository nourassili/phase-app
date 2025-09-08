// app/services/firebase.ts
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
// If your linter complains about this path, keep this comment.
// eslint-disable-next-line import/no-unresolved
import { getReactNativePersistence } from 'firebase/auth/react-native';
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

let auth: Auth;
if (Platform.OS === 'web') {
  const webAuth = getAuth(app);
  // Set web persistence; you don't need to await this for initialization.
  setPersistence(webAuth, browserLocalPersistence);
  auth = webAuth;
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
