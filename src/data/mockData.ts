export const user = {
  firstName: 'Maya',
  fullName: 'Maya Chen',
  memberSince: 'Jun 2026',
  cycleStatus: 'Perimenopause',
};

export const cycleStatus = {
  day: 19,
  phase: 'Luteal',
  daysToPeriod: 3,
  label: 'Day 19 · Luteal · 3 days to period',
};

export const energyOptions = ['Low', 'Med', 'High'] as const;
export const symptomOptions = ['Bloating', 'Poor sleep', 'Cramps', 'None today'] as const;

export const todaysPlan = {
  training: {
    title: 'Low-intensity strength',
    subtitle: '28 min · full body, lighter loads',
  },
  food: {
    title: 'Protein + magnesium focus',
    subtitle: 'Aim for 100g protein today',
  },
};

export const streakText = '🔥 12-day check-in streak — your longest yet.';

export const coachOpeningMessage =
  "Hi Maya — I noticed your energy's been low this week. What's on your mind?";

export const coachSuggestedQuestions = [
  'Why am I so tired this week?',
  'What should I eat before training today?',
];

export const trainFilters = ['Strength', 'Mobility', 'Low-impact', 'Bone density'] as const;

export type Workout = {
  id: string;
  name: string;
  durationMin: number;
  equipment: string;
  intensityTag: string;
  badgeColor: string;
  description: string;
  filter: (typeof trainFilters)[number];
};

export const workouts: Workout[] = [
  {
    id: '1',
    name: 'Low-Intensity Full Body',
    durationMin: 28,
    equipment: 'Dumbbells',
    intensityTag: 'Today',
    badgeColor: '#3D2A4A',
    description:
      'Squat to bench, band rows, dead bug, incline walk. Lighter loads, longer rests — built for lower-energy days without losing the training stimulus.',
    filter: 'Strength',
  },
  {
    id: '2',
    name: 'Bone-Loading Circuit',
    durationMin: 35,
    equipment: 'Barbell',
    intensityTag: 'Bone density',
    badgeColor: '#7C8F6E',
    description:
      'Heavier compound lifts — deadlift, overhead press, step-ups. Impact and load are the two biggest levers for bone density in perimenopause.',
    filter: 'Bone density',
  },
  {
    id: '3',
    name: 'Mobility & Breath Reset',
    durationMin: 15,
    equipment: 'No equipment',
    intensityTag: 'Recovery',
    badgeColor: '#5B7A99',
    description:
      'Hip openers, thoracic rotation, box breathing. Good for high-symptom days when you still want to move.',
    filter: 'Mobility',
  },
  {
    id: '4',
    name: 'Follicular Power Session',
    durationMin: 40,
    equipment: 'Barbell',
    intensityTag: 'High energy',
    badgeColor: '#D9A441',
    description:
      'Heavier singles and doubles — saved for when your check-ins show rising energy, usually early in your cycle.',
    filter: 'Strength',
  },
];

export const proteinProgress = {
  current: 64,
  target: 100,
};

export const recipes = [
  {
    id: '1',
    name: 'Magnesium Bowl',
    description: 'Salmon, quinoa, spinach, tahini',
  },
  {
    id: '2',
    name: 'Protein Overnight Oats',
    description: 'Greek yogurt, oats, berries, flax',
  },
  {
    id: '3',
    name: 'Bone-Broth Miso Soup',
    description: 'Collagen, tofu, seaweed, ginger',
  },
];

export const exploreMenuItems = [
  { id: 'together', label: 'Together — your circle', destructive: false },
  { id: 'notifications', label: 'Notifications', destructive: false },
  { id: 'privacy', label: 'Privacy & data', destructive: false },
  { id: 'subscription', label: 'Subscription', destructive: false },
  { id: 'help', label: 'Help & support', destructive: false },
  { id: 'logout', label: 'Log out', destructive: true },
];

export const circleMembers = [
  { id: 'r', initial: 'R', color: '#D9A441' },
  { id: 'j', initial: 'J', color: '#5B7A99' },
  { id: 'p', initial: 'P', color: '#C97C8C' },
];

export type FeedPost = {
  id: string;
  author: string;
  initial: string;
  avatarColor: string;
  body: string;
  meta: string;
  cheers: number;
  cheered: boolean;
};

export const feedPosts: FeedPost[] = [
  {
    id: '1',
    author: 'Renata',
    initial: 'R',
    avatarColor: '#D9A441',
    body: 'completed Low-Intensity Full Body',
    meta: '32 min ago · 28 min session',
    cheers: 6,
    cheered: false,
  },
  {
    id: '2',
    author: 'Priya',
    initial: 'P',
    avatarColor: '#C97C8C',
    body: 'hit a bodyweight deadlift PR 🎉',
    meta: '3h ago · Bone-Loading Circuit',
    cheers: 19,
    cheered: false,
  },
  {
    id: '3',
    author: 'Jo',
    initial: 'J',
    avatarColor: '#5B7A99',
    body: 'reached a 7-day check-in streak',
    meta: 'Yesterday',
    cheers: 11,
    cheered: false,
  },
  {
    id: '4',
    author: 'You',
    initial: 'Y',
    avatarColor: '#7C8F6E',
    body: 'completed Mobility & Breath Reset',
    meta: '2 days ago · 15 min session',
    cheers: 4,
    cheered: false,
  },
];

export function generateContribLevels(days = 91): number[] {
  const levels: number[] = [];
  for (let i = 0; i < days; i++) {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const rand = seed - Math.floor(seed);
    if (rand < 0.18) levels.push(0);
    else if (rand < 0.45) levels.push(1);
    else if (rand < 0.78) levels.push(2);
    else levels.push(3);
  }
  return levels;
}
