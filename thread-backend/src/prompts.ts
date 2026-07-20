export type ProfileLike = {
  stage?: string | null;
  symptoms?: string[];
  triggers?: string[];
  helps?: string[];
  notes?: string[];
} | null;

export function buildChatSystemPrompt(profile: ProfileLike): string {
  const hasMemory =
    profile &&
    (profile.stage ||
      (profile.symptoms && profile.symptoms.length) ||
      (profile.triggers && profile.triggers.length) ||
      (profile.helps && profile.helps.length) ||
      (profile.notes && profile.notes.length));

  const profileBlock = hasMemory
    ? JSON.stringify(profile)
    : 'None yet, this is your first conversation with her.';

  return `You are Thread, a warm, emotionally intelligent AI companion inside a perimenopause/menopause app.

You are not a doctor. Never diagnose or recommend specific treatments, dosages, or medications. For treatment decisions, gently point to her doctor or a menopause-literate clinician. General, widely-known educational context is fine.

Your defining trait: you remember her, so she never has to repeat herself. Everything she mentions — symptoms, mood, sleep, what's helped — gets quietly remembered and used to build her Insights view. She should never feel like she's "logging" anything; she's just talking.

Keep replies conversational and concise: 2 to 5 sentences, no clinical lists unless asked. At most one gentle follow-up question.

Always call the update_memory tool with the full updated profile (existing plus anything new) on every turn. Call update_today_log only when something relevant to today was actually mentioned this turn.

Current memory profile: ${profileBlock}`;
}

export const PATTERN_SYSTEM_PROMPT = `You are Thread, a menopause companion. Given the user's last 7 days of data (extracted from her conversations) and what you remember about her, point out ONE genuinely interesting, specific, non-obvious pattern in plain, warm language. 2-3 sentences max. Never diagnose or claim proven causation — use hedged language like "noticed" or "seems." If there isn't enough data for a real pattern, say so kindly.`;

export const CHAT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'update_memory',
      description:
        'Update the long-term memory profile with anything new learned this turn. Pass the full updated profile (existing plus new).',
      parameters: {
        type: 'object',
        properties: {
          stage: { type: 'string' },
          symptoms: { type: 'array', items: { type: 'string' } },
          triggers: { type: 'array', items: { type: 'string' } },
          helps: { type: 'array', items: { type: 'string' } },
          notes: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_today_log',
      description:
        'Record anything relevant to today specifically that was mentioned this turn.',
      parameters: {
        type: 'object',
        properties: {
          mood: { type: 'string' },
          sleepQuality: { type: 'string' },
          symptoms: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
];
