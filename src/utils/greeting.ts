import { AFFIRMATIONS } from '../constants/affirmations';

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

export function getTodayAffirmation(): string {
  const dayIdx = new Date().getDate() % AFFIRMATIONS.length;
  return AFFIRMATIONS[dayIdx];
}
