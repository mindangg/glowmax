import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_CATEGORIES, TOTAL_DAILY_TASKS } from '../lib/dailyTasks';

// Persists checked task ids per calendar date: key = 'daily_YYYY-MM-DD'

function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `daily_${y}-${m}-${d}`;
}

export function useDailyTasks(date: Date) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const storageKey = getDateKey(date);

  // Load persisted state for this date
  useEffect(() => {
    setLoaded(false);
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) {
        try {
          const arr: string[] = JSON.parse(raw);
          setChecked(new Set(arr));
        } catch {
          setChecked(new Set());
        }
      } else {
        setChecked(new Set());
      }
      setLoaded(true);
    });
  }, [storageKey]);

  const toggle = useCallback(
    async (taskId: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(taskId)) {
          next.delete(taskId);
        } else {
          next.add(taskId);
        }
        // Persist asynchronously
        AsyncStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        return next;
      });
    },
    [storageKey]
  );

  const completedCount = checked.size;
  const totalCount = TOTAL_DAILY_TASKS;

  return { checked, toggle, completedCount, totalCount, loaded };
}
