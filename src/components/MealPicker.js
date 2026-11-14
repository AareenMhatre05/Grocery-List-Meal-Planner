import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, UtensilsCrossed } from "lucide-react";
import Modal from "../ui/Modal";
import { Button, Input, Skeleton, ErrorNote, EmptyState, FoodImage, Select, cx } from "../ui/ui";
import { sizedThumb, loadMealIndex, fuzzySearchMeals, mealsByIngredient, mealsByCategory, toPlanEntry, slotLabel, SLOTS, mealIsNonVeg, LOCAL_MEALS, localMealsWith } from "../lib/meals";
import { useStoredState, KEYS } from "../lib/storage";
import { toKey, addDays, startOfWeek, formatDayShort, formatDayMonth } from "../lib/dates";

// Suggestions: first pantry item, otherwise the saved diet preference
function useStarterMeals(enabled) {
  const [pantry] = useStoredState(KEYS.pantry, []);
  const [profile] = useStoredState(KEYS.profile, {});
  const [state, setState] = useState({ loading: false, meals: [], error: null, basis: "" });

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const load = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        let meals = [];
        let basis = "";
        if (pantry.length) {
          meals = [...localMealsWith(pantry[0]), ...(await mealsByIngredient(pantry[0]))];
          basis = `Uses ${pantry[0]} from your pantry`;
        }
        if (!meals.length) {
          const pref = profile?.dietPreference;
          const local = LOCAL_MEALS.filter((m) => (pref === "nonveg" ? !m.veg : m.veg));
          meals = [...local, ...(await mealsByCategory(pref === "nonveg" ? "Chicken" : "Vegetarian"))];
          basis = pref === "nonveg" ? "Non-veg dishes" : "Vegetarian dishes";
        }
        if (live) setState({ loading: false, meals: meals.slice(0, 18), error: null, basis });
      } catch {
        if (live) setState({ loading: false, meals: [], error: "Couldn't load suggestions. Check your connection.", basis: "" });
      }
    };
    load();
    return () => {
      live = false;
    };
  }, [enabled, pantry, profile?.dietPreference]);

  return state;
}

function MealGrid({ meals, onPick, selectedId }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {meals.map((m) => (
        <li key={m.idMeal}>
          <button
            type="button"
            onClick={() => onPick(m)}
            className={cx(
              "press group w-full overflow-hidden rounded-lg border bg-cream-50 text-left",
              selectedId === m.idMeal ? "border-forest ring-1 ring-forest" : "border-forest/10 hover:border-forest/30"
            )}
          >
            <FoodImage src={sizedThumb(m.strMealThumb, "preview")} alt="" ratio="aspect-[4/3]" />
            <span className="block px-3 py-2">
              <span className="line-clamp-2 text-sm font-medium leading-snug text-ink">{m.strMeal}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MealPickerModal({ open, onClose, dateKey, dateLabel, slot, current, onPick, onRemove }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results, setResults] = useState({ loading: false, meals: [], error: null });
  const starter = useStarterMeals(open && !submitted);
  const [profile] = useStoredState(KEYS.profile, {});

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSubmitted("");
      setResults({ loading: false, meals: [], error: null });
    }
  }, [open]);

  const runSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmitted(q);
    setResults({ loading: true, meals: [], error: null });
    try {
      setResults({ loading: false, meals: fuzzySearchMeals(await loadMealIndex(), q).slice(0, 30), error: null });
    } catch {
      setResults({ loading: false, meals: [], error: "Search failed. Check your connection and try again." });
    }
  };

  const view = submitted ? results : starter;
  const pref = profile?.dietPreference;
  const meals = useMemo(
    () => (view.meals || []).filter((m) => (pref === "veg" ? !mealIsNonVeg(m) : true)),
    [view.meals, pref]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={slot ? `${current ? "Change" : "Add"} ${slotLabel(slot).toLowerCase()}` : ""}
      description={dateLabel}
      footer={
        current && (
          <Button variant="danger" icon={Trash2} onClick={() => onRemove(dateKey, slot)}>
            Remove {current.name}
          </Button>
        )
      }
    >
      <form onSubmit={runSearch} className="flex gap-2" role="search">
        <label htmlFor="meal-search" className="sr-only">Search recipes</label>
        <div className="relative flex-1">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
          <Input id="meal-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes, e.g. dosa, dal, pasta" className="pl-9" autoComplete="off" />
        </div>
        <Button type="submit" variant="primary">Search</Button>
      </form>

      <p className="mb-3 mt-5 text-sm text-ink-muted">
        {submitted ? `Results for “${submitted}”` : starter.basis || "Suggestions"}
        {submitted && (
          <button type="button" className="ml-2 font-medium text-ink underline" onClick={() => { setSubmitted(""); setQuery(""); }}>
            Back to suggestions
          </button>
        )}
      </p>

      {view.error ? (
        <ErrorNote>{view.error}</ErrorNote>
      ) : view.loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3.6] rounded-lg" />
          ))}
        </div>
      ) : meals.length ? (
        <MealGrid meals={meals} selectedId={current?.id} onPick={(m) => onPick(dateKey, slot, toPlanEntry(m))} />
      ) : (
        <EmptyState icon={UtensilsCrossed} title="No recipes found">
          Try a broader word like “rice”, “paneer” or “soup”.
        </EmptyState>
      )}
    </Modal>
  );
}

// Used on a recipe page: pick the day and the slot for a known meal
export function AddToPlanModal({ open, onClose, meal, onConfirm }) {
  const today = new Date();
  const days = useMemo(() => {
    const start = startOfWeek(today);
    return Array.from({ length: 14 }, (_, i) => addDays(start, i)).filter((d) => toKey(d) >= toKey(today));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const [dateKey, setDateKey] = useState(toKey(today));
  const [slot, setSlot] = useState("dinner");
  const [plan] = useStoredState(KEYS.plan, {});
  const taken = plan?.[dateKey]?.[slot];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to your week"
      description={meal?.strMeal}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(dateKey, slot)}>{taken ? "Replace meal" : "Add to plan"}</Button>
        </>
      }
    >
      <div className="grid gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan-day" className="text-sm font-medium">Day</label>
          <Select id="plan-day" value={dateKey} onChange={(e) => setDateKey(e.target.value)}>
            {days.map((d) => (
              <option key={toKey(d)} value={toKey(d)}>
                {toKey(d) === toKey(today) ? "Today, " : ""}{formatDayShort(d)} {formatDayMonth(d)}
              </option>
            ))}
          </Select>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Meal</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SLOTS.map((s) => (
              <label key={s.id} className={cx("press flex h-10 cursor-pointer items-center justify-center gap-2 rounded border text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-forest", slot === s.id ? "border-forest bg-forest text-cream" : "border-forest/15 bg-cream-50 text-ink-soft hover:border-forest/30")}>
                <input type="radio" name="slot" value={s.id} checked={slot === s.id} onChange={() => setSlot(s.id)} className="sr-only" />
                <s.icon size={16} strokeWidth={1.75} aria-hidden />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>
        {taken && (
          <p className="text-sm text-ink-soft">
            This replaces <span className="font-medium text-ink">{taken.name}</span>.
          </p>
        )}
      </div>
    </Modal>
  );
}
