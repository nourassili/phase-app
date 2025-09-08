// app/context/AuthContext.tsx
import { signOut as fbSignOut, onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';

type AuthContextType = { user: User | null; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => sub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signOut: () => fbSignOut(auth) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
