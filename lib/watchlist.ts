'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { playableIds } from './catalog';

const STORAGE_KEY = 'animeblock.watchlist.v2';
const LEGACY_KEY = 'watchedAnime';
const EMPTY = new Set<string>();

interface StoredWatchlist {
  version: 2;
  ids: string[];
  updatedAt: string;
}

let snapshot: Set<string> | null = null;
const listeners = new Set<() => void>();

function sanitizeIds(ids: unknown[]): Set<string> {
  return new Set(
    ids.filter((id): id is string => typeof id === 'string' && playableIds.has(id)),
  );
}

function readFromStorage(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredWatchlist>;
      if (Array.isArray(parsed.ids)) return sanitizeIds(parsed.ids);
    }

    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      const ids = sanitizeIds(Array.isArray(parsed) ? parsed : []);
      writeToStorage(ids);
      window.localStorage.removeItem(LEGACY_KEY);
      return ids;
    }
  } catch {
    // A broken localStorage entry should not take the app down.
  }

  return new Set();
}

function writeToStorage(ids: Set<string>): void {
  try {
    const payload: StoredWatchlist = {
      version: 2,
      ids: [...ids].sort(),
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Private mode / quota errors are non-fatal.
  }
}

function getSnapshot(): Set<string> {
  if (typeof window === 'undefined') return EMPTY;
  if (snapshot === null) snapshot = readFromStorage();
  return snapshot;
}

function getServerSnapshot(): Set<string> {
  return EMPTY;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function commit(next: Set<string>): void {
  snapshot = next;
  writeToStorage(next);
  notify();
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  snapshot = null;
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', handleStorage);
  };
}

export function useWatchlist() {
  const watched = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    if (!playableIds.has(id)) return;
    const next = new Set(getSnapshot());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    commit(next);
  }, []);

  const merge = useCallback((ids: string[]) => {
    const next = new Set(getSnapshot());
    for (const id of ids) if (playableIds.has(id)) next.add(id);
    commit(next);
    return next.size;
  }, []);

  const clear = useCallback(() => {
    commit(new Set());
  }, []);

  const exportIds = useCallback(() => [...getSnapshot()].sort(), []);

  return { watched, toggle, merge, clear, exportIds };
}
