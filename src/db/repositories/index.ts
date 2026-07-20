import { getOrCreateUserId } from '../client';
import { deleteProfile } from './profile';
import { deleteAllDailyEntries } from './dailyEntry';
import { deleteAllMessages } from './conversation';

/** Hard-deletes Profile, DailyEntry, and ConversationMessage rows for the user. */
export async function forgetEverything(): Promise<void> {
  const userId = await getOrCreateUserId();
  await deleteAllMessages(userId);
  await deleteAllDailyEntries(userId);
  await deleteProfile(userId);
}
