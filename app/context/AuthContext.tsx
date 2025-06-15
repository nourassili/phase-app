import type { User } from '@supabase/supabase-js'; // ✅ Use the real Supabase User type
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

// Define the shape of the context
type AuthContextType = {
  user: User | null;
  signOut: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider wraps your app and provides the auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch the initial session when the app loads
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });

    // Subscribe to future auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Logout function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth context safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
