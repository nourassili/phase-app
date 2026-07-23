import { supabase } from '../lib/supabase';

/** Returns the signed-in Supabase auth user id, or throws. */
export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user?.id;
  if (!userId) {
    throw new Error('Not signed in');
  }
  return userId;
}
