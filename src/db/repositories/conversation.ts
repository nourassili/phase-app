import { requireUserId } from '../client';
import { supabase } from '../../lib/supabase';
import type { ConversationMessage } from '../../types/models';

type MessageRow = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  display_text: string;
  created_at: string;
};

function rowToMessage(row: MessageRow): ConversationMessage {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    content: row.content,
    displayText: row.display_text,
    createdAt: row.created_at,
  };
}

export async function getMessages(): Promise<ConversationMessage[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as MessageRow[]).map(rowToMessage);
}

export async function appendMessage(
  message: Omit<ConversationMessage, 'userId'> & { userId?: string },
): Promise<ConversationMessage> {
  const userId = message.userId || (await requireUserId());
  const row: ConversationMessage = {
    userId,
    id: message.id,
    role: message.role,
    content: message.content,
    displayText: message.displayText,
    createdAt: message.createdAt,
  };

  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      id: row.id,
      user_id: row.userId,
      role: row.role,
      content: row.content,
      display_text: row.displayText,
      created_at: row.createdAt,
    })
    .select('*')
    .single();

  if (error) throw error;
  return rowToMessage(data as MessageRow);
}

export async function clearMessages(userId?: string): Promise<void> {
  const id = userId ?? (await requireUserId());
  const { error } = await supabase
    .from('conversation_messages')
    .delete()
    .eq('user_id', id);
  if (error) throw error;
}

export async function deleteAllMessages(userId?: string): Promise<void> {
  await clearMessages(userId);
}
