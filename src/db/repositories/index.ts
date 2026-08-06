import { requireUserId } from '../client';
import { clearProfileMemory } from './profile';
import { deleteAllDailyEntries } from './dailyEntry';
import { deleteAllMessages } from './conversation';

/**
 * Hard-deletes conversation + daily entries and clears profile memory.
 * Preserves consent and onboarding completion on the profile row.
 */
export async function forgetEverything(): Promise<void> {
  const userId = await requireUserId();
  await deleteAllMessages(userId);
  await deleteAllDailyEntries(userId);
  await clearProfileMemory(userId);
}
