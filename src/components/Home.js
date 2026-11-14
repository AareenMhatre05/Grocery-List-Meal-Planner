import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { ArrowRight, CalendarPlus, Plus, ShoppingBasket, Refrigerator, ChefHat } from "lucide-react";
import { auth, db } from "../firebase";
import { ButtonLink, SectionTitle, FoodImage, EmptyState, cx } from "../ui/ui";
import { useStoredState, KEYS } from "../lib/storage";
import { usePlan } from "../lib/plan";
import { SLOTS, sizedThumb } from "../lib/meals";
import { toKey, addDays, startOfWeek, weekDays, formatLong, formatDayShort, isSameDay, formatWeekday } from "../lib/dates";

// Rough end of each meal window, used to decide what is still "coming up" today
const SLOT_ENDS = { breakfast: 11, lunch: 15, snack: 18, dinner: 23 };

function useProfileName() {
  const [name, setName] = useState("");
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDoc(doc(db, "profiles", user.uid))
      .then((snap) => snap.exists() && setName(snap.data().name || ""))
      .catch(() => {});
  }, []);
  return name;
}

function TodaySlot({ slot, entry, dateKey }) {
  if (!entry) {
    return (
      <Link
        to={`/planner?date=${dateKey}&slot=${slot.id}`}
        className="press group flex h-full min-h-[9.5rem] flex-col justify-between rounded-lg border border-dashed border-forest/20 p-3 hover:border-forest/40 hover:bg-cream-50"
      >
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
          <slot.icon size={16} strokeWidth={1.75} aria-hidden className="text-forest-400" />
          {slot.label}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-ink-muted group-hover:text-ink">
          <Plus size={16} strokeWidth={1.75} aria-hidden />
          Plan {slot.label.toLowerCase()}
        </span>
      </Link>
    );
  }
  return (
    <Link to={`/meal/${entry.id}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-forest/10 bg-cream-50 hover:border-forest/25">
      <FoodImage src={sizedThumb(entry.thumb, "medium")} alt="" ratio="aspect-[4/3]" />
      <span className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <slot.icon size={14} strokeWidth={1.75} aria-hidden />
          {slot.label}
        </span>
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:underline">{entry.name}</span>
      </span>
    </Link>
  );
}

function Home() {
  const name = useProfileName();
  const { plan } = usePlan();
  const [list] = useStoredState(KEYS.grocery, []);
  const [pantry] = useStoredState(KEYS.pantry, []);

  const today = new Date();
  const todayKey = toKey(today);
  const todayPlan = plan[todayKey] || {};
  const todayCount = Object.keys(todayPlan).length;
  const week = weekDays(startOfWeek(today));
  const plannedThisWeek = week.reduce((n, d) => n + Object.keys(plan[toKey(d)] || {}).length, 0);
  const remaining = list.filter((i) => !i.done);
  const inBasket = list.length - remaining.length;

  const upcoming = useMemo(() => {
    const hour = new Date().getHours();
    const out = [];
    for (let i = 0; i < 7 && out.length < 4; i++) {
      const d = addDays(new Date(), i);
      const day = plan[toKey(d)] || {};
      ["breakfast", "lunch", "snack", "dinner"].forEach((slot) => {
        if (!day[slot] || out.length >= 4) return;
        if (i === 0 && hour >= SLOT_ENDS[slot]) return;
        out.push({ date: d, slot, entry: day[slot] });
      });
    }
    return out;
  }, [plan]);

  return (
    <>
      {/* Title: the day, not a greeting */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.025em]">{formatLong(today)}</h1>
          <p className="mt-2 text-ink-soft">
            {todayCount ? `${todayCount} of 4 meals planned today` : "Nothing planned for today yet"}
            {name ? ` · ${name}'s kitchen` : ""}
          </p>
        </div>
        <ButtonLink to="/planner" icon={CalendarPlus}>Plan meals</ButtonLink>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-10 lg:gap-y-10">
        {/* Today's meals */}
        <section aria-labelledby="today-h">
          <SectionTitle id="today-h" action={<Link to="/planner" className="rounded text-sm font-medium text-ink-soft hover:text-ink hover:underline">Open planner</Link>}>
            Today's meals
          </SectionTitle>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {SLOTS.map((slot) => (
              <li key={slot.id}>
                <TodaySlot slot={slot} entry={todayPlan[slot.id]} dateKey={todayKey} />
              </li>
            ))}
          </ul>
        </section>

        {/* Grocery summary */}
        <div className="lg:row-span-3 lg:self-start">
        <section aria-labelledby="buy-h" className="rounded-xl bg-forest p-5 text-cream on-forest">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="buy-h" className="text-lg font-semibold text-cream">Still to buy</h2>
            <span className="tnum font-display text-3xl font-semibold leading-none text-pink">{remaining.length}</span>
          </div>
          {list.length > 0 && (
            <p className="tnum mt-1 text-sm text-cream/70">{inBasket} of {list.length} already in the basket</p>
          )}
          {remaining.length ? (
            <ul className="mt-4 border-t border-cream/10">
              {remaining.slice(0, 7).map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-3 border-b border-cream/10 py-2.5 text-sm">
                  <span className="truncate text-cream">{item.name}</span>
                  <span className="tnum shrink-0 text-cream/70">{[item.qty, item.unit].filter(Boolean).join(" ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-cream/75">
              {list.length ? "Everything on your list is in the basket." : "Nothing on your list yet. Add a recipe's ingredients and anything in your pantry is skipped."}
            </p>
          )}
          {remaining.length > 7 && <p className="tnum mt-2 text-sm text-cream/70">and {remaining.length - 7} more</p>}
          <Link to="/grocery" className="press mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-cream text-[0.9375rem] font-medium text-forest hover:bg-cream-100">
            <ShoppingBasket size={16} strokeWidth={1.75} aria-hidden />
            {list.length ? "Open grocery list" : "Start a list"}
          </Link>
        </section>
        </div>

        {/* Week overview */}
        <section aria-labelledby="week-h">
          <SectionTitle id="week-h" action={<span className="tnum text-sm text-ink-soft">{plannedThisWeek} of 28 planned</span>}>
            This week
          </SectionTitle>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-forest/10" role="progressbar" aria-label="Meals planned this week" aria-valuenow={plannedThisWeek} aria-valuemin={0} aria-valuemax={28}>
            <div className="h-full origin-left rounded-full bg-forest transition-transform duration-300 ease-out" style={{ transform: `scaleX(${plannedThisWeek / 28})` }} />
          </div>
          <ol className="grid grid-cols-7 gap-1.5">
            {week.map((d) => {
              const key = toKey(d);
              const day = plan[key] || {};
              const isToday = isSameDay(d, today);
              return (
                <li key={key}>
                  <Link
                    to={`/planner?date=${key}`}
                    aria-label={`${formatLong(d)}: ${Object.keys(day).length} of 4 meals planned`}
                    className={cx(
                      "press flex flex-col items-center gap-1.5 rounded-lg border py-2.5",
                      isToday ? "border-forest/30 bg-cream-50" : "border-transparent hover:border-forest/15 hover:bg-cream-50"
                    )}
                  >
                    <span className={cx("text-xs", isToday ? "font-semibold text-pink-700" : "text-ink-muted")}>{formatDayShort(d)}</span>
                    <span className="tnum font-display text-lg font-semibold leading-none text-ink">{d.getDate()}</span>
                    <span className="grid grid-cols-2 gap-0.5" aria-hidden>
                      {SLOTS.map((s) => (
                        <span key={s.id} className={cx("h-1.5 w-1.5 rounded-full", day[s.id] ? "bg-forest" : "bg-forest/15")} />
                      ))}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Coming up + pantry */}
        <div className="grid gap-8 md:grid-cols-2 lg:col-start-1">
          <section aria-labelledby="next-h">
            <SectionTitle id="next-h">Coming up</SectionTitle>
            {upcoming.length ? (
              <ul className="rounded-xl border border-forest/10 bg-cream-50 px-3">
                {upcoming.map(({ date, slot, entry }) => (
                  <li key={`${toKey(date)}-${slot}`} className="border-b border-forest/[0.08] last:border-b-0">
                    <Link to={`/meal/${entry.id}`} className="group flex items-center gap-3 rounded py-2.5">
                      <FoodImage src={sizedThumb(entry.thumb, "preview")} alt="" ratio="aspect-square" className="w-11 shrink-0 rounded" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink group-hover:underline">{entry.name}</span>
                        <span className="block text-xs text-ink-muted">
                          {isSameDay(date, today) ? "Today" : isSameDay(date, addDays(today, 1)) ? "Tomorrow" : formatWeekday(date)} · {SLOTS.find((s) => s.id === slot).label}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={CalendarPlus} title="Nothing planned yet" action={<ButtonLink to="/planner" variant="secondary" size="sm">Open planner</ButtonLink>}>
                Meals you plan for the next seven days show up here.
              </EmptyState>
            )}
          </section>

          <section aria-labelledby="pantry-h">
            <SectionTitle id="pantry-h" action={<Link to="/pantry" className="rounded text-sm font-medium text-ink-soft hover:text-ink hover:underline">Edit</Link>}>
              In your pantry
            </SectionTitle>
            {pantry.length ? (
              <>
                <ul className="flex flex-wrap gap-1.5">
                  {pantry.slice(0, 10).map((p) => (
                    <li key={p}>
                      <Link to={`/meals?ingredient=${encodeURIComponent(p)}`} className="press inline-flex h-8 items-center rounded-full border border-forest/15 bg-cream-50 px-3 text-sm text-ink hover:border-forest/35">
                        {p}
                      </Link>
                    </li>
                  ))}
                  {pantry.length > 10 && <li className="tnum flex h-8 items-center px-2 text-sm text-ink-muted">+{pantry.length - 10}</li>}
                </ul>
                <Link to="/meals" className="mt-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink hover:underline">
                  <ChefHat size={16} strokeWidth={1.75} aria-hidden />
                  Recipes from your pantry
                  <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
                </Link>
              </>
            ) : (
              <EmptyState icon={Refrigerator} title="Start with your pantry" action={<ButtonLink to="/pantry" size="sm">Add pantry items</ButtonLink>}>
                Tell us what you have and recipes are suggested around it.
              </EmptyState>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Home;
