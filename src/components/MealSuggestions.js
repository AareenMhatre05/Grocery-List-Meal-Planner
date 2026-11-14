import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { ChefHat, Refrigerator, Search, X } from "lucide-react";
import { PageHeader, Segmented, Skeleton, EmptyState, ErrorNote, Button, ButtonLink, FoodImage, Input, cx } from "../ui/ui";
import { useStoredState, KEYS } from "../lib/storage";
import { mealIsNonVeg, loadMealIndex, fuzzySearchMeals, LOCAL_MEALS, localMealsWith } from "../lib/meals";

const API = "https://www.themealdb.com/api/json/v1/1";
const asList = (data) => (Array.isArray(data?.meals) ? data.meals : []);
const PANTRY = "__pantry__"; // every pantry item, merged and ranked
const MAX_PANTRY_QUERIES = 10;
const PAGE = 24;

function RecipeCard({ meal }) {
  const uses = meal.uses || [];
  return (
    <li>
      <Link to={`/meal/${meal.idMeal}`} className="group block rounded-xl focus-visible:outline-offset-4">
        <FoodImage src={meal.strMealThumb} alt="" className="rounded-xl" ratio="aspect-[4/3]" />
        <h3 className="mt-3 font-sans text-md font-semibold leading-snug text-ink decoration-forest/40 group-hover:underline">{meal.strMeal}</h3>
        {uses.length > 0 ? (
          <p className="mt-0.5 text-sm text-ink-muted">
            Uses <span className={cx(uses.length > 1 && "font-medium text-ink-soft")}>{uses.join(", ")}</span> from your pantry
          </p>
        ) : (
          (meal.strArea || meal.strCategory) && <p className="mt-0.5 text-sm text-ink-muted">{[meal.strCategory, meal.strArea].filter(Boolean).join(" · ")}</p>
        )}
      </Link>
    </li>
  );
}

function MealSuggestions() {
  const [params, setParams] = useSearchParams();
  const [pantryItems] = useStoredState(KEYS.pantry, []);
  const [profile, setProfile] = useStoredState(KEYS.profile, {});
  const filter = profile?.dietPreference || "all";
  const [ingredient, setIngredient] = useState(() => params.get("ingredient") || (pantryItems.length ? PANTRY : ""));
  const [state, setState] = useState({ loading: true, meals: [], error: null });
  const [attempt, setAttempt] = useState(0);
  const [shown, setShown] = useState(PAGE);
  const pantryKey = pantryItems.join("|");

  // Search: fuzzy match over the whole catalogue, loaded on the first search
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [index, setIndex] = useState({ loading: false, items: null, error: null });
  const [indexAttempt, setIndexAttempt] = useState(0);
  const searching = debounced.trim().length >= 2;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!searching || index.items) return;
    let live = true;
    setIndex({ loading: true, items: null, error: null });
    loadMealIndex()
      .then((items) => live && setIndex({ loading: false, items, error: null }))
      .catch(() => live && setIndex({ loading: false, items: null, error: "Couldn't load recipes to search. Check your connection." }));
    return () => {
      live = false;
    };
    // index.items is the only part that matters: once loaded, searches run locally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching, indexAttempt]);

  // A new selection or search starts from the first page again
  useEffect(() => setShown(PAGE), [ingredient, filter, debounced]);

  // Keep the selection valid when the pantry changes
  useEffect(() => {
    if (params.get("ingredient")) return;
    if (!pantryItems.length) setIngredient("");
    else if (ingredient !== PANTRY && ingredient && !pantryItems.includes(ingredient)) setIngredient(PANTRY);
    else if (!ingredient && pantryItems.length) setIngredient(PANTRY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantryKey]);

  useEffect(() => {
    let live = true;
    const fetchMeals = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        let meals;
        if (ingredient === PANTRY) {
          // Merge recipes across pantry items; rank by how many pantry items each one uses
          const items = pantryItems.slice(0, MAX_PANTRY_QUERIES);
          const results = await Promise.all(items.map((i) => axios.get(`${API}/filter.php?i=${encodeURIComponent(i)}`)));
          const byId = new Map();
          const perItem = results.map((res, idx) => [...localMealsWith(items[idx]), ...asList(res.data)]);
          perItem.forEach((list, idx) => {
            list.forEach((m) => {
              const entry = byId.get(m.idMeal) || { ...m, uses: [] };
              entry.uses.push(items[idx]);
              byId.set(m.idMeal, entry);
            });
          });
          meals = [...byId.values()].sort((a, b) => b.uses.length - a.uses.length || a.strMeal.localeCompare(b.strMeal));
        } else if (ingredient) {
          const res = await axios.get(`${API}/filter.php?i=${encodeURIComponent(ingredient)}`);
          meals = [...localMealsWith(ingredient), ...asList(res.data)].map((m) => ({ ...m, uses: pantryItems.includes(ingredient) ? [ingredient] : [] }));
        } else if (filter === "veg") {
          meals = [...LOCAL_MEALS.filter((m) => m.veg), ...asList((await axios.get(`${API}/filter.php?c=Vegetarian`)).data)];
        } else if (filter === "nonveg") {
          meals = [...LOCAL_MEALS.filter((m) => !m.veg), ...asList((await axios.get(`${API}/filter.php?c=Beef`)).data)];
        } else {
          meals = [...LOCAL_MEALS, ...asList((await axios.get(`${API}/search.php?f=c`)).data)];
        }
        if (live) setState({ loading: false, meals, error: null });
      } catch {
        if (live) setState({ loading: false, meals: [], error: "Couldn't load recipes. Check your connection." });
      }
    };
    fetchMeals();
    return () => {
      live = false;
    };
    // pantryKey stands in for pantryItems so a new array with the same items does not refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredient, filter, attempt, pantryKey]);

  const setFilter = (value) => setProfile((p) => ({ ...(p || {}), dietPreference: value }));

  const choose = (value) => {
    setIngredient(value);
    if (params.get("ingredient")) setParams({}, { replace: true });
  };

  const source = useMemo(
    () => (searching ? (index.items ? fuzzySearchMeals(index.items, debounced) : []) : state.meals),
    [searching, index.items, debounced, state.meals]
  );
  const meals = useMemo(
    () => source.filter((m) => (filter === "all" ? true : filter === "veg" ? !mealIsNonVeg(m) : mealIsNonVeg(m))),
    [source, filter]
  );
  const view = searching
    ? { loading: index.loading || (!index.items && !index.error), error: index.error, retry: () => setIndexAttempt((n) => n + 1) }
    : { loading: state.loading, error: state.error, retry: () => setAttempt((n) => n + 1) };

  const extra = ingredient && ingredient !== PANTRY && !pantryItems.includes(ingredient) ? [ingredient] : [];
  const chips = [
    ...(pantryItems.length ? [{ value: PANTRY, label: "Whole pantry" }] : []),
    ...[...extra, ...pantryItems].slice(0, 10).map((p) => ({ value: p, label: p })),
  ];

  const description = searching
    ? `Recipes matching “${debounced.trim()}”, closest matches first. Spelling mistakes are fine.`
    : ingredient === PANTRY
      ? "Dishes built from what's in your pantry, the ones that use the most of it first."
      : ingredient
        ? `Dishes you can make with ${ingredient}${pantryItems.includes(ingredient) ? " from your pantry" : ""}.`
        : "Add pantry items to get recipes built around what you have. Until then, here are some ideas.";

  const filterWord = filter === "veg" ? "vegetarian " : filter === "nonveg" ? "non-veg " : "";

  return (
    <>
      <PageHeader
        title="Recipes"
        description={description}
        actions={
          <Segmented
            label="Diet"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "veg", label: "Veg" },
              { value: "nonveg", label: "Non-veg" },
            ]}
          />
        }
      />

      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-6 max-w-xl">
        <label htmlFor="recipe-search" className="sr-only">Search recipes</label>
        <div className="relative">
          <Search size={16} strokeWidth={1.75} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            id="recipe-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search recipes, e.g. dosa, paneer, biryani"
            autoComplete="off"
            className="pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="press absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-ink-muted hover:bg-forest/[0.06] hover:text-ink"
            >
              <X size={16} strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>
      </form>

      {searching ? null : chips.length > 0 ? (
        <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Cook with">
          <span className="mr-1 text-sm text-ink-muted">Cook with</span>
          {chips.map((c) => {
            const active = c.value === ingredient;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={active}
                onClick={() => choose(c.value)}
                className={cx(
                  "press h-8 rounded-full border px-3 text-sm",
                  active ? "border-forest bg-forest font-medium text-cream" : "border-forest/15 bg-cream-50 text-ink-soft hover:border-forest/35 hover:text-ink"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-8">
          <ButtonLink to="/pantry" variant="secondary" icon={Refrigerator}>Add pantry items</ButtonLink>
        </div>
      )}

      {view.error ? (
        <ErrorNote onRetry={view.retry}>{view.error}</ErrorNote>
      ) : view.loading ? (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading recipes">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="mt-3 h-4 w-2/3" />
            </li>
          ))}
        </ul>
      ) : meals.length ? (
        <>
          <p className="tnum mb-4 text-sm text-ink-muted">
            {meals.length > shown ? `Showing ${shown} of ${meals.length} recipes` : `${meals.length} ${meals.length === 1 ? "recipe" : "recipes"}`}
          </p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {meals.slice(0, shown).map((meal) => (
              <RecipeCard key={meal.idMeal} meal={meal} />
            ))}
          </ul>
          {meals.length > shown && (
            <div className="mt-10 flex justify-center">
              <Button variant="secondary" onClick={() => setShown((n) => n + PAGE)}>
                Show {Math.min(PAGE, meals.length - shown)} more
              </Button>
            </div>
          )}
        </>
      ) : searching ? (
        <EmptyState icon={Search} title={`No ${filterWord}recipes match “${debounced.trim()}”`}>
          {filter !== "all" ? "Try switching the diet filter to All, or a broader word like “curry” or “chicken”." : "Try a broader word like “curry”, “chicken” or “cake”."}
        </EmptyState>
      ) : (
        <EmptyState
          icon={ChefHat}
          title={ingredient === PANTRY ? `No ${filterWord}recipes match your pantry` : ingredient ? `No ${filterWord}recipes with ${ingredient}` : "No recipes found"}
        >
          {ingredient ? "Try another pantry item or switch the diet filter to All." : "Switch the diet filter or add items to your pantry."}
        </EmptyState>
      )}
    </>
  );
}

export default MealSuggestions;
