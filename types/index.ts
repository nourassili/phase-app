// types/index.ts
export interface Symptom {
  id: string;
  name: string;
  icon: string;
  category: 'physical' | 'emotional' | 'hormonal';
}

export interface LoggedSymptom extends Symptom {
  intensity: number;
  notes?: string;
}

export interface DayLog {
  date: string;
  symptoms: LoggedSymptom[];
  mood?: number;
  energy?: number;
  flow?: 'none' | 'light' | 'medium' | 'heavy';
  notes?: string;
}

export interface CycleData {
  id: string;
  startDate: string;
  endDate?: string;
  length?: number;
  avgCycleLength: number;
  symptoms: LoggedSymptom[];
}

export interface PeriodPrediction {
  nextPeriodDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
  confidence: number;
}

export interface UserProfile {
  name: string;
  age: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  lastPeriodDate?: string;
  notifications: {
    periodReminder: boolean;
    fertileWindow: boolean;
    symptomReminder: boolean;
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface HealthInsight {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'celebration';
  category: 'cycle' | 'symptoms' | 'mood' | 'general';
  date: string;
}

export interface CalendarDay {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
  customStyles?: {
    container?: object;
    text?: object;
  };
}

export type FlowIntensity = 'none' | 'light' | 'medium' | 'heavy';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';