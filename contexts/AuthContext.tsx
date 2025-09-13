// contexts/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";

type AuthShape = {
  // state
  user: User | null;
  loading: boolean;
  onboardingDone: boolean;
  entitled: boolean;

  // actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  doSignOut: () => Promise<void>;

  // flags
  setOnboardingDone: (v: boolean) => void;
  setEntitled: (v: boolean) => void;

  // onboarding helpers (optional but useful)
  ensureAuthedForOnboarding: () => Promise<User>;
  linkEmailPassword: (email: string, password: string) => Promise<void>;

  // DEV only: clear local flags quickly
  devResetLocalFlags: () => Promise<void>;
};

const OB_KEY = "phase.onboardingDone";
const EN_KEY = "phase.entitled";

const Ctx = createContext<AuthShape | undefined>(undefined);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider>");
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const [entitled, setEntitledState] = useState(false);

  // Load persisted flags on boot
  useEffect(() => {
    (async () => {
      try {
        const [ob, en] = await Promise.all([
          AsyncStorage.getItem(OB_KEY),
          AsyncStorage.getItem(EN_KEY),
        ]);
        setOnboardingDoneState(ob === "1");
        setEntitledState(en === "1");
      } finally {
        // no-op
      }
    })();
  }, []);

  // Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // flag setters (persist)
  const setOnboardingDone = (v: boolean) => {
    setOnboardingDoneState(v);
    AsyncStorage.setItem(OB_KEY, v ? "1" : "0");
  };
  const setEntitled = (v: boolean) => {
    setEntitledState(v);
    AsyncStorage.setItem(EN_KEY, v ? "1" : "0");
  };

  // auth actions
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };
  const doSignOut = async () => {
    await signOut(auth);
    // Optional: also clear flags here if you want a truly fresh state after logout.
    // await AsyncStorage.multiRemove([OB_KEY, EN_KEY]);
    // setOnboardingDoneState(false);
    // setEntitledState(false);
  };

  // onboarding helpers
  const ensureAuthedForOnboarding = async () => {
    // If no user yet, sign in anonymously so you get a UID to attach onboarding answers to.
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser!;
  };

  const linkEmailPassword = async (email: string, password: string) => {
    const u = auth.currentUser;
    if (!u) throw new Error("No current user to link.");
    if (u.isAnonymous) {
      const cred = EmailAuthProvider.credential(email, password);
      await linkWithCredential(u, cred); // keeps same UID and any onboarding data you saved
    }
    // else already a “real” account — nothing to do
  };

  // DEV: quick reset of local flags (this is what you asked about)
  const devResetLocalFlags = async () => {
    await AsyncStorage.multiRemove([OB_KEY, EN_KEY]);
    setOnboardingDoneState(false);
    setEntitledState(false);
  };

  const value: AuthShape = {
    user,
    loading,
    onboardingDone,
    entitled,
    signIn,
    signUp,
    resetPassword,
    doSignOut,
    setOnboardingDone,
    setEntitled,
    ensureAuthedForOnboarding,
    linkEmailPassword,
    devResetLocalFlags,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
