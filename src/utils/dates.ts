export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatMmDd(dateStr: string): string {
  return dateStr.slice(5);
}

/** Returns last N YYYY-MM-DD keys including today, oldest first. */
export function lastNDateKeys(n: number, from = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    keys.push(todayKey(d));
  }
  return keys;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
