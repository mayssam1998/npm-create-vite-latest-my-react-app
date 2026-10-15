import { createStore, del, get, set } from 'idb-keyval';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

const DATABASE_NAME = 'insightx';
const STORE_NAME = 'persisted-state';

let idbStore: ReturnType<typeof createStore> | undefined;

/** Opened on first use, so importing this module never touches IndexedDB. */
function getIdbStore() {
  idbStore ??= createStore(DATABASE_NAME, STORE_NAME);
  return idbStore;
}

/**
 * Zustand `persist` storage backed by IndexedDB (via idb-keyval, decided Oct 15, 2026).
 *
 * Values are stored as structured clones, not JSON, so persisted state may hold `File` and
 * `Blob` objects (an attached correspondence) as well as large text. Use it for anything
 * that would not fit comfortably in localStorage. Only plain data may be persisted —
 * `partialize` away functions.
 */
export function createIndexedDbStorage<TState>(): PersistStorage<TState> {
  return {
    getItem: async (name) => (await get<StorageValue<TState>>(name, getIdbStore())) ?? null,
    setItem: (name, value) => set(name, value, getIdbStore()),
    removeItem: (name) => del(name, getIdbStore()),
  };
}
