import { useCallback, useEffect, useState } from 'react';
import { getRecentDailyEntries } from '../db/repositories/dailyEntry';
import type { DailyEntry } from '../types/models';

export function useDailyEntries(limit = 7) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getRecentDailyEntries(limit);
    setEntries(next);
    setLoading(false);
    return next;
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}
