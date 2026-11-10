import { useCallback, useEffect, useState } from "react";

// Browser-stored state shared between components and tabs.
// Writes broadcast a same-tab event so every hook using the key stays in sync.
const EVENT = "gmp:storage";

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: keep the in-memory value */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
}

export function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback));

  useEffect(() => {
    const sync = (e) => {
      const changedKey = e.type === EVENT ? e.detail?.key : e.key;
      if (changedKey === key) setValue(read(key, fallback));
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // fallback is a literal at each call site; re-subscribing on identity change is unnecessary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(read(key, fallback)) : next;
      write(key, resolved);
      setValue(resolved);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, update];
}

export const KEYS = {
  pantry: "pantry", // string[] (format kept from the original app)
  plan: "mealPlan", // { [YYYY-MM-DD]: { breakfast|lunch|dinner|snack: {id, name, thumb} } }
  grocery: "groceryList", // GroceryItem[]
  profile: "userProfile", // { dietPreference: "all" | "veg" | "nonveg" }
};

export function readStored(key, fallback) {
  return read(key, fallback);
}

export function writeStored(key, value) {
  write(key, value);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
