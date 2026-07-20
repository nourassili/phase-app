import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';
import { newId } from '../utils/dates';

const DB_NAME = 'thread.db';
const USER_ID_KEY = 'userId';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(SCHEMA_SQL);
      return db;
    })();
  }
  return dbPromise;
}

export async function getOrCreateUserId(): Promise<string> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    [USER_ID_KEY],
  );
  if (row?.value) return row.value;

  const userId = newId();
  await db.runAsync('INSERT INTO app_meta (key, value) VALUES (?, ?)', [
    USER_ID_KEY,
    userId,
  ]);
  return userId;
}
