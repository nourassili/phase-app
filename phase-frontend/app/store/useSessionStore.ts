import { create } from "zustand";

type Session = {
  user: {
    id: string;
    email: string;
    questionnaire_completed: boolean;
    profile_completed: boolean;
  };
};

interface SessionState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
