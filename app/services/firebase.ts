// app/services/firebase.ts
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  signOut as fbSignOut,
  getAuth,
  GoogleAuthProvider,
  initializeAuth
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { Platform } from 'react-native';

// ⚠️ Use Expo public env vars (safe to embed in client)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

// Auth with proper persistence for web vs native
export const auth =
  Platform.OS === 'web'
    ? (() => {
        const a = getAuth(app);
        a.setPersistence(browserLocalPersistence);
        return a;
      })()
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });

export const googleProvider = new GoogleAuthProvider();

// Re-export common types/helpers
export type { User } from 'firebase/auth';
export const signOut = () => fbSignOut(auth);
