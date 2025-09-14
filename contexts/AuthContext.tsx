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
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";

type AuthShape = {
  // state
  user: User | null;
  loading: boolean;    // true until Firebase fires first auth event
  hydrated: boolean;   // true when BOTH: (1) Firebase fired AND (2) local flags loaded
  onboardingDone: boolean;
  entitled: boolean;

  // actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  doSignOut: () => Promise<void>;

  // flags (persisted; await these before routing)
  setOnboardingDone: (v: boolean) => Promise<void>;
  setEntitled: (v: boolean) => Promise<void>;

  // onboarding helpers
  ensureAuthedForOnboarding: () => Promise<User>;
  linkEmailPassword: (email: string, password: string) => Promise<void>;

  // DEV only
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

  // Loading flags
  const [loading, setLoading] = useState(true);          // Firebase auth listener not fired yet
  const [flagsLoaded, setFlagsLoaded] = useState(false); // AsyncStorage flags loaded
  const hydrated = loading === false && flagsLoaded === true;

  // App flags
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const [entitled, setEntitledState] = useState(false);

  // --- Load persisted flags on boot (once) ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ob, en] = await Promise.all([
          AsyncStorage.getItem(OB_KEY),
          AsyncStorage.getItem(EN_KEY),
        ]);
        if (!cancelled) {
          setOnboardingDoneState(ob === "1");
          setEntitledState(en === "1");
        }
      } finally {
        if (!cancelled) setFlagsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Firebase auth state (sets user & clears `loading`) ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // --- Persisted setters you can await (important for guards/navigation) ---
  const setOnboardingDone = async (v: boolean) => {
    setOnboardingDoneState(v);
    await AsyncStorage.setItem(OB_KEY, v ? "1" : "0");
  };

  const setEntitled = async (v: boolean) => {
    setEntitledState(v);
    await AsyncStorage.setItem(EN_KEY, v ? "1" : "0");
  };

  // --- Auth actions ---
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
    // Optional: clear local flags on sign-out if you want a truly fresh app state.
    // await AsyncStorage.multiRemove([OB_KEY, EN_KEY]);
    // setOnboardingDoneState(false);
    // setEntitledState(false);
  };

  // --- Onboarding helpers ---
  const ensureAuthedForOnboarding = async () => {
    // Make sure we have a UID to attach onboarding answers to.
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    // `onAuthStateChanged` will set user; return the current user for convenience.
    const u = auth.currentUser;
    if (!u) throw new Error("Failed to establish anonymous session.");
    return u;
  };

  const linkEmailPassword = async (email: string, password: string) => {
    const u = auth.currentUser;
    if (!u) throw new Error("No current user to link.");
    if (u.isAnonymous) {
      const cred = EmailAuthProvider.credential(email, password);
      await linkWithCredential(u, cred); // keeps same UID + any onboarding data
    }
    // If already non-anonymous, nothing to do.
  };

  // --- DEV: reset just the local flags (doesn't affect Firebase user) ---
  const devResetLocalFlags = async () => {
    await AsyncStorage.multiRemove([OB_KEY, EN_KEY]);
    setOnboardingDoneState(false);
    setEntitledState(false);
  };

  const value: AuthShape = useMemo(
    () => ({
      user,
      loading,
      hydrated,
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
    }),
    [
      user,
      loading,
      hydrated,
      onboardingDone,
      entitled,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
