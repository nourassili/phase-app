import { create } from "zustand";

type Session = {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_pregant: boolean;
    questionnaire_completed: boolean;
    profile_completed: boolean;
    user_lang?: string;
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
