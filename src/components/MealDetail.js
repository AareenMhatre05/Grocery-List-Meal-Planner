import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarPlus, ListPlus, Check, PlayCircle, UtensilsCrossed } from "lucide-react";
import { Button, Skeleton, EmptyState, ErrorNote, ButtonLink, FoodImage, cx } from "../ui/ui";
import { useToast } from "../ui/Toast";
import { SprigDivider } from "../ui/Spots";
import { AddToPlanModal } from "./MealPicker";
import { sizedThumb, lookupMeal, mealIngredients, mealSteps, youtubeEmbed, toPlanEntry, slotLabel } from "../lib/meals";
import { usePlan } from "../lib/plan";
import { useStoredState, KEYS } from "../lib/storage";
import { inPantry, mergeIngredients } from "../lib/grocery";
import { fromKey, formatDayShort } from "../lib/dates";

function MealDetail() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing | error
  const [attempt, setAttempt] = useState(0);
  const [planOpen, setPlanOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [pantry] = useStoredState(KEYS.pantry, []);
  const [, setList] = useStoredState(KEYS.grocery, []);
  const { setMeal: setPlanMeal } = usePlan();
  const toast = useToast();

  useEffect(() => {
    let live = true;
    setStatus("loading");
    setShowVideo(false);
    lookupMeal(id)
      .then((m) => {
        if (!live) return;
        setMeal(m);
        setStatus(m ? "ready" : "missing");
      })
      .catch(() => live && setStatus("error"));
    return () => {
      live = false;
    };
  }, [id, attempt]);

  const back = (
    <Link to="/meals" className="mb-6 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-soft hover:text-ink">
      <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
      Recipes
    </Link>
  );

  if (status === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading recipe">
        {back}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="mt-4 h-10 w-56" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <>
        {back}
        <ErrorNote onRetry={() => setAttempt((n) => n + 1)}>Couldn't load this recipe. Check your connection.</ErrorNote>
      </>
    );
  }

  if (status === "missing") {
    return (
      <>
        {back}
        <EmptyState icon={UtensilsCrossed} title="Recipe not found" action={<ButtonLink to="/meals" variant="secondary">Browse recipes</ButtonLink>}>
          It may have been removed from TheMealDB.
        </EmptyState>
      </>
    );
  }

  const ingredients = mealIngredients(meal);
  const steps = mealSteps(meal);
  const video = youtubeEmbed(meal.strYoutube);
  const haveCount = ingredients.filter((i) => inPantry(pantry, i.name)).length;

  const addToList = () => {
    let result;
    setList((list) => {
      result = mergeIngredients(list, pantry, ingredients, meal.strMeal);
      return result.next;
    });
    const parts = [];
    if (result.skippedPantry) parts.push(`${result.skippedPantry} in your pantry`);
    if (result.skippedList) parts.push(`${result.skippedList} already on the list`);
    toast(
      result.added
        ? `${result.added} ingredients added to your list${parts.length ? `, skipped ${parts.join(" and ")}` : ""}`
        : "Nothing to add: everything is in your pantry or already on the list"
    );
  };

  const confirmPlan = (dateKey, slot) => {
    setPlanMeal(dateKey, slot, toPlanEntry(meal));
    setPlanOpen(false);
    toast(`Planned for ${formatDayShort(fromKey(dateKey))} ${slotLabel(slot).toLowerCase()}`);
  };

  return (
    <article>
      {back}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <figure>
          <FoodImage src={meal.strMealThumb} alt={meal.strMeal} className="rounded-xl" ratio="aspect-[4/3]" />
          {meal.photoCredit && (
            <figcaption className="mt-2 text-xs text-ink-muted">
              Photo:{" "}
              <a href={meal.photoCredit.source} target="_blank" rel="noreferrer" className="underline decoration-forest/30 hover:text-ink">
                {meal.photoCredit.author}
              </a>
              {", "}
              {meal.photoCredit.licenseUrl ? (
                <a href={meal.photoCredit.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-forest/30 hover:text-ink">
                  {meal.photoCredit.license}
                </a>
              ) : (
                meal.photoCredit.license
              )}
              , via Wikimedia Commons
            </figcaption>
          )}
        </figure>

        <div className="flex flex-col">
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.025em]">{meal.strMeal}</h1>
          <p className="mt-4 text-ink-soft">
            {[meal.strCategory, meal.region ?? (meal.strArea !== "Unknown" && meal.strArea), meal.time && `${meal.time} min`, meal.serves && `Serves ${meal.serves}`]
              .filter(Boolean)
              .map((t) => `${t} · `)}
            {ingredients.length} ingredients
            {pantry.length > 0 && (
              <>
                {" · "}
                <span className={cx(haveCount ? "font-medium text-ink" : "")}>{haveCount} in your pantry</span>
              </>
            )}
            {steps.length > 1 && ` · ${steps.length} steps`}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button icon={CalendarPlus} onClick={() => setPlanOpen(true)}>Add to plan</Button>
            <Button variant="secondary" icon={ListPlus} onClick={addToList}>Add ingredients to list</Button>
          </div>
          {meal.strYoutube && (
            <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-fit items-center gap-1.5 rounded text-sm font-medium text-ink-soft hover:text-ink hover:underline">
              <PlayCircle size={16} strokeWidth={1.75} aria-hidden />
              Watch on YouTube
            </a>
          )}
        </div>
      </div>

      <SprigDivider className="mt-10" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <section aria-labelledby="ingredients-h">
          <h2 id="ingredients-h" className="mb-3 text-xl font-semibold">Ingredients</h2>
          <ul className="rounded-xl border border-forest/10 bg-cream-50 px-4">
            {ingredients.map((ing, i) => {
              const have = inPantry(pantry, ing.name);
              return (
                <li key={i} className="flex min-h-[2.75rem] items-center gap-3 border-b border-forest/[0.08] py-2 last:border-b-0">
                  <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", have ? "bg-forest text-cream" : "border border-forest/25")}>
                    {have && <Check size={12} strokeWidth={2.5} aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink">{ing.name}</span>
                    {have && <span className="sr-only"> (in your pantry)</span>}
                  </span>
                  {ing.measure && <span className="tnum shrink-0 text-right text-sm text-ink-soft">{ing.measure}</span>}
                </li>
              );
            })}
          </ul>
          {pantry.length > 0 && haveCount > 0 && (
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest text-cream"><Check size={10} strokeWidth={2.5} aria-hidden /></span>
              In your pantry, left off the grocery list
            </p>
          )}
        </section>

        <section aria-labelledby="method-h">
          <h2 id="method-h" className="mb-3 text-xl font-semibold">Method</h2>
          <ol className="flex flex-col gap-5">
            {steps.map((step, i) => (
              <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span className="tnum mt-0.5 font-display text-lg font-semibold leading-6 text-forest-400" aria-hidden>{i + 1}</span>
                <p className="max-w-[68ch] leading-7 text-ink">{step}</p>
              </li>
            ))}
          </ol>

          {video && (
            <div className="mt-10">
              <h2 className="mb-3 text-xl font-semibold">Video</h2>
              {showVideo ? (
                <div className="aspect-video overflow-hidden rounded-xl bg-forest-900">
                  <iframe
                    src={`${video}?autoplay=1`}
                    title={`${meal.strMeal} video`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className="press group flex w-full max-w-xl items-center gap-4 rounded-xl bg-forest p-3 pr-5 text-left text-cream hover:bg-forest-600"
                >
                  <span className="relative w-28 shrink-0 overflow-hidden rounded-lg">
                    <img src={sizedThumb(meal.strMealThumb, "preview")} alt="" className="aspect-video w-full object-cover opacity-80" loading="lazy" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink text-forest-900">
                        <PlayCircle size={20} strokeWidth={1.75} aria-hidden />
                      </span>
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">Play the video tutorial</span>
                    <span className="block text-sm text-cream/70">{meal.videoChannel ? `By ${meal.videoChannel}, opens here from YouTube` : "Opens here, from YouTube"}</span>
                  </span>
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      <AddToPlanModal open={planOpen} onClose={() => setPlanOpen(false)} meal={meal} onConfirm={confirmPlan} />
    </article>
  );
}

export default MealDetail;
