// Persistent calculation history, capped at the last 10 results.
// One entry per (raceId, totalSeconds) pair — re-running the same calc
// moves the existing entry to the front instead of duplicating it.

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pace.calcHistory';
const MAX_ENTRIES = 10;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function save(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    /* localStorage unavailable */
  }
}

export function useCalcHistory() {
  const [history, setHistory] = useState(load);

  // Keep the in-memory copy in sync when another tab edits localStorage.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setHistory(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addEntry = useCallback((entry) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (e) => !(e.raceId === entry.raceId && e.totalSeconds === entry.totalSeconds)
      );
      const next = [{ ...entry, timestamp: Date.now() }, ...filtered].slice(0, MAX_ENTRIES);
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    save([]);
  }, []);

  return { history, addEntry, clearHistory };
}
