export type Profile = {
  userId: string;
  stage: string | null;
  symptoms: string[];
  triggers: string[];
  helps: string[];
  notes: string[];
  updatedAt: string;
  consentedAt: string | null;
  consentVersion: string | null;
  onboardingCompletedAt: string | null;
};

export type DailyEntry = {
  userId: string;
  date: string;
  mood: string | null;
  sleepQuality: string | null;
  symptoms: string[];
};

export type ConversationMessage = {
  userId: string;
  id: string;
  role: 'user' | 'assistant';
  content: string;
  displayText: string;
  createdAt: string;
};

export type ProfileUpdate = {
  stage?: string;
  symptoms?: string[];
  triggers?: string[];
  helps?: string[];
  notes?: string[];
};

export type TodayLogUpdate = {
  mood?: string;
  sleepQuality?: string;
  symptoms?: string[];
};

export type OnboardingSeed = {
  stage?: string | null;
  symptoms?: string[];
  notes?: string[];
};
