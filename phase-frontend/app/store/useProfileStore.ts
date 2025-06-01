import { create } from "zustand";

export interface Profile {
  id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  timezone: string;
  is_pregnant: boolean;
  questionnaire_completed?: boolean;
  profile_completed: boolean;
}

interface ProfileStore {
  profile: Profile;
  setProfile: (profileData: Profile) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_pregnant: false,
    questionnaire_completed: false,
    profile_completed: false,
  },
  setProfile: (profileData) => set(() => ({ profile: profileData })),
}));
