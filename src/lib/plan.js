import { useCallback } from "react";
import { useStoredState, KEYS } from "./storage";

export function usePlan() {
  const [plan, setPlan] = useStoredState(KEYS.plan, {});

  const setMeal = useCallback(
    (dateKey, slot, entry) => setPlan((p) => ({ ...p, [dateKey]: { ...(p?.[dateKey] || {}), [slot]: entry } })),
    [setPlan]
  );

  const removeMeal = useCallback(
    (dateKey, slot) =>
      setPlan((p) => {
        const day = { ...(p?.[dateKey] || {}) };
        delete day[slot];
        const next = { ...p, [dateKey]: day };
        if (!Object.keys(day).length) delete next[dateKey];
        return next;
      }),
    [setPlan]
  );

  return { plan: plan || {}, setMeal, removeMeal };
}
