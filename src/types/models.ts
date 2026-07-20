export type Profile = {
  userId: string;
  stage: string | null;
  symptoms: string[];
  triggers: string[];
  helps: string[];
  notes: string[];
  updatedAt: string;
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
