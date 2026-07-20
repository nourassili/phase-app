import { getDb, getOrCreateUserId } from '../client';
import type { ConversationMessage } from '../../types/models';

type MessageRow = {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  displayText: string;
  createdAt: string;
};

export async function getMessages(): Promise<ConversationMessage[]> {
  const db = await getDb();
  const userId = await getOrCreateUserId();
  const rows = await db.getAllAsync<MessageRow>(
    `SELECT * FROM conversation_messages
     WHERE userId = ?
     ORDER BY createdAt ASC`,
    [userId],
  );
  return rows;
}

export async function appendMessage(
  message: Omit<ConversationMessage, 'userId'> & { userId?: string },
): Promise<ConversationMessage> {
  const db = await getDb();
  const userId = message.userId ?? (await getOrCreateUserId());
  const row: ConversationMessage = {
    userId,
    id: message.id,
    role: message.role,
    content: message.content,
    displayText: message.displayText,
    createdAt: message.createdAt,
  };
  await db.runAsync(
    `INSERT INTO conversation_messages (id, userId, role, content, displayText, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.userId, row.role, row.content, row.displayText, row.createdAt],
  );
  return row;
}

export async function clearMessages(userId?: string): Promise<void> {
  const db = await getDb();
  const id = userId ?? (await getOrCreateUserId());
  await db.runAsync('DELETE FROM conversation_messages WHERE userId = ?', [id]);
}

export async function deleteAllMessages(userId?: string): Promise<void> {
  await clearMessages(userId);
}
