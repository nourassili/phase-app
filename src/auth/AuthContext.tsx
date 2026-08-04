import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as Linking from 'expo-linking';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (newPassword: string) => Promise<void>;
  cancelPasswordRecovery: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseAuthParams(url: string): Record<string, string> {
  const normalized = url.replace('#', '?');
  const queryIndex = normalized.indexOf('?');
  if (queryIndex < 0) return {};
  const query = normalized.slice(queryIndex + 1);
  const params: Record<string, string> = {};
  for (const part of query.split('&')) {
    if (!part) continue;
    const [rawKey, ...rest] = part.split('=');
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rest.join('=') || '');
    if (key) params[key] = value;
  }
  return params;
}

function urlIndicatesPasswordRecovery(url: string, params: Record<string, string>): boolean {
  if (params.type === 'recovery') return true;
  try {
    const { path } = Linking.parse(url);
    if (path?.includes('reset-password')) return true;
  } catch {
    // ignore parse failures; fall through
  }
  return url.includes('reset-password');
}

async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const createSessionFromUrl = useCallback(async (url: string) => {
    const params = parseAuthParams(url);
    if (params.error || params.error_code) {
      throw new Error(params.error_description || params.error || 'Auth link failed.');
    }

    const recovery = urlIndicatesPasswordRecovery(url, params);

    if (params.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
      if (recovery) setIsPasswordRecovery(true);
      return;
    }

    const access_token = params.access_token;
    const refresh_token = params.refresh_token;
    if (!access_token || !refresh_token) return;

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    if (recovery) setIsPasswordRecovery(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    const handleUrl = (url: string | null) => {
      if (!url) return;
      void createSessionFromUrl(url).catch(() => {
        // Deep-link failures surface when the user tries again or stays signed out.
      });
    };

    void Linking.getInitialURL().then(handleUrl);
    const linkSub = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, [createSessionFromUrl]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return { needsEmailConfirm: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsPasswordRecovery(false);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const email = session?.user?.email;
      if (!email) {
        throw new Error('Cannot verify password: no signed-in email.');
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError) {
        throw new Error('Current password is incorrect.');
      }

      await updatePassword(newPassword);
    },
    [session],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const redirectTo = Linking.createURL('reset-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) throw error;
  }, []);

  const completePasswordReset = useCallback(
    async (newPassword: string) => {
      if (!isPasswordRecovery) {
        throw new Error('No password recovery session. Request a new reset link.');
      }
      await updatePassword(newPassword);
      setIsPasswordRecovery(false);
    },
    [isPasswordRecovery],
  );

  const cancelPasswordRecovery = useCallback(async () => {
    setIsPasswordRecovery(false);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isPasswordRecovery,
      signIn,
      signUp,
      signOut,
      changePassword,
      requestPasswordReset,
      completePasswordReset,
      cancelPasswordRecovery,
    }),
    [
      session,
      loading,
      isPasswordRecovery,
      signIn,
      signUp,
      signOut,
      changePassword,
      requestPasswordReset,
      completePasswordReset,
      cancelPasswordRecovery,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
