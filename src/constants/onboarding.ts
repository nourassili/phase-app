/** Bump when consent copy changes enough to re-prompt existing users. */
export const CONSENT_VERSION = 'pilot-1';

export const STAGE_OPTIONS = [
  { id: 'perimenopause', label: 'Perimenopause' },
  { id: 'menopause', label: 'Menopause' },
  { id: 'postmenopause', label: 'Postmenopause' },
  { id: 'not_sure', label: 'Not sure' },
] as const;

export const HARDEST_OPTIONS = [
  { id: 'sleep', label: 'Sleep' },
  { id: 'hot_flashes', label: 'Hot flashes / night sweats' },
  { id: 'mood', label: 'Mood' },
  { id: 'brain_fog', label: 'Brain fog' },
  { id: 'periods', label: 'Periods changing' },
  { id: 'energy', label: 'Energy' },
] as const;

export const CONSENT_BODY = `Thread is not a doctor or medical device. Support and information only, not diagnosis or treatment advice.

What you share is saved in your account and sent to Thread's servers and Azure OpenAI to generate replies. Never sold. Never shared with an employer or insurer.

Erase Thread's memory anytime in Settings. If you're in crisis, contact local emergency services or a crisis line (US: call or text 988). Thread can't help in an emergency.`;
