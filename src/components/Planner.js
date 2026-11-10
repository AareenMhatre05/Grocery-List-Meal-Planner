import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, ListPlus, Pencil } from "lucide-react";
import { PageHeader, Button, IconButton, FoodImage, EmptyState, cx } from "../ui/ui";
import { PlateSpot } from "../ui/Spots";
import { useToast } from "../ui/Toast";
import { MealPickerModal } from "./MealPicker";
import { usePlan } from "../lib/plan";
import { SLOTS, slotLabel, lookupMeal, mealIngredients } from "../lib/meals";
import { useStoredState, KEYS } from "../lib/storage";
import { mergeIngredients } from "../lib/grocery";
import { toKey, fromKey, addDays, startOfWeek, weekDays, formatDayShort, formatWeekRange, formatLong, isSameDay } from "../lib/dates";

function SlotCell({ entry, slot, dateKey, onOpen, compact }) {
  if (!entry) {
    return (
      <button
        type="button"
        onClick={() => onOpen(dateKey, slot)}
        aria-label={`Add ${slotLabel(slot).toLowerCase()} for ${formatLong(fromKey(dateKey))}`}
        className={cx(
          "group flex w-full items-center justify-center gap-1.5 text-sm text-ink-muted transition-colors duration-fast hover:text-ink",
          compact
            ? "h-full min-h-[8.5rem] hover:bg-forest/[0.04] focus-visible:rounded-none focus-visible:outline-offset-[-2px]"
            : "press h-16 rounded-lg border border-dashed border-forest/20 hover:border-forest/40 hover:bg-cream-50"
        )}
      >
        <Plus size={compact ? 14 : 16} strokeWidth={1.75} aria-hidden className={compact ? "opacity-40 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100" : ""} />
        <span className={compact ? "sr-only" : ""}>Add {slotLabel(slot).toLowerCase()}</span>
      </button>
    );
  }

  if (compact) {
    return (
      <div className="group relative h-full">
        <Link to={`/meal/${entry.id}`} className="block h-full hover:bg-forest/[0.04] focus-visible:rounded-none focus-visible:outline-offset-[-2px]">
          <FoodImage src={entry.thumb ? `${entry.thumb}/preview` : null} alt="" ratio="aspect-[4/3]" />
          <span className="block px-2 pb-2 pt-1.5">
            <span className="line-clamp-2 text-[0.8125rem] font-medium leading-snug text-ink">{entry.name}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => onOpen(dateKey, slot)}
          aria-label={`Change ${slotLabel(slot).toLowerCase()}: ${entry.name}`}
          className="press absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded bg-cream-50/95 text-ink opacity-0 shadow-sheet focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Pencil size={14} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-forest/10 bg-cream-50 p-2 pr-1">
      <Link to={`/meal/${entry.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded">
        <FoodImage src={entry.thumb ? `${entry.thumb}/preview` : null} alt="" ratio="aspect-square" className="w-14 shrink-0 rounded" />
        <span className="line-clamp-2 font-medium leading-snug text-ink">{entry.name}</span>
      </Link>
      <IconButton icon={Pencil} label={`Change ${slotLabel(slot).toLowerCase()}`} onClick={() => onOpen(dateKey, slot)} />
    </div>
  );
}

export default function Planner() {
  const today = new Date();
  const [params, setParams] = useSearchParams();
  const initialDate = params.get("date") ? fromKey(params.get("date")) : today;
  const [weekStart, setWeekStart] = useState(() => startOfWeek(initialDate));
  const [activeDay, setActiveDay] = useState(() => toKey(initialDate));
  const [picker, setPicker] = useState(null); // { dateKey, slot }
  const [adding, setAdding] = useState(false);
  const { plan, setMeal, removeMeal } = usePlan();
  const [pantry] = useStoredState(KEYS.pantry, []);
  const [, setList] = useStoredState(KEYS.grocery, []);
  const toast = useToast();

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const isThisWeek = isSameDay(weekStart, startOfWeek(today));
  const planned = days.reduce((n, d) => n + Object.keys(plan[toKey(d)] || {}).length, 0);

  // Deep link from the dashboard: /planner?date=YYYY-MM-DD&slot=lunch
  useEffect(() => {
    const date = params.get("date");
    const slot = params.get("slot");
    if (date && slot && SLOTS.some((s) => s.id === slot)) setPicker({ dateKey: date, slot });
    if (date || slot) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shiftWeek = (n) => {
    const next = addDays(weekStart, 7 * n);
    setWeekStart(next);
    setActiveDay(toKey(isSameDay(startOfWeek(today), next) ? today : next));
  };
  const goToday = () => {
    setWeekStart(startOfWeek(today));
    setActiveDay(toKey(today));
  };

  const openPicker = (dateKey, slot) => setPicker({ dateKey, slot });
  const pick = (dateKey, slot, entry) => {
    setMeal(dateKey, slot, entry);
    setPicker(null);
    toast(`${entry.name} added to ${formatDayShort(fromKey(dateKey))} ${slotLabel(slot).toLowerCase()}`);
  };
  const remove = (dateKey, slot) => {
    const name = plan[dateKey]?.[slot]?.name;
    removeMeal(dateKey, slot);
    setPicker(null);
    toast(`${name} removed`);
  };

  const addWeekToList = async () => {
    const entries = days.flatMap((d) => Object.values(plan[toKey(d)] || {}));
    if (!entries.length) return;
    setAdding(true);
    try {
      const unique = [...new Map(entries.map((e) => [e.id, e])).values()];
      const meals = await Promise.all(unique.map((e) => lookupMeal(e.id)));
      let totals = { added: 0, skippedPantry: 0 };
      setList((list) => {
        let next = list;
        meals.filter(Boolean).forEach((m) => {
          const r = mergeIngredients(next, pantry, mealIngredients(m), m.strMeal);
          next = r.next;
          totals.added += r.added;
          totals.skippedPantry += r.skippedPantry;
        });
        return next;
      });
      toast(
        totals.added
          ? `${totals.added} ingredients added to your list${totals.skippedPantry ? `, ${totals.skippedPantry} already in your pantry` : ""}`
          : "Everything for this week is already on your list or in your pantry"
      );
    } catch {
      toast("Couldn't load the recipes. Check your connection and try again.");
    } finally {
      setAdding(false);
    }
  };

  const activeDate = fromKey(activeDay);

  return (
    <>
      <PageHeader
        title="Week planner"
        description={`${planned} of 28 meals planned for ${formatWeekRange(weekStart)}`}
        actions={
          <Button variant="secondary" icon={ListPlus} onClick={addWeekToList} loading={adding} disabled={!planned}>
            Add week to grocery list
          </Button>
        }
      />

      {/* Week navigation */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <IconButton icon={ChevronLeft} label="Previous week" onClick={() => shiftWeek(-1)} />
          <IconButton icon={ChevronRight} label="Next week" onClick={() => shiftWeek(1)} />
          <h2 className="ml-2 text-lg font-semibold" aria-live="polite">
            {formatWeekRange(weekStart)}
          </h2>
        </div>
        {!isThisWeek && (
          <Button variant="ghost" size="sm" onClick={goToday}>
            This week
          </Button>
        )}
      </div>

      {planned === 0 && (
        <EmptyState art={<PlateSpot />} title="Nothing planned this week" className="mb-5">
          Choose any empty slot below to add a meal. Planned meals appear on Today and can fill your grocery list.
        </EmptyState>
      )}

      {/* Desktop: the ledger, days as columns and meals as ruled rows */}
      <div className="hidden overflow-hidden rounded-xl border border-forest/10 bg-cream-50/60 lg:block">
        <div className="grid grid-cols-[6.5rem_repeat(7,minmax(0,1fr))]">
          <div className="border-b border-forest/10" />
          {days.map((d) => {
            const isToday = isSameDay(d, today);
            return (
              <div key={toKey(d)} className={cx("border-b border-l border-forest/10 px-2 py-3", isToday && "bg-cream-50")}>
                <p className={cx("text-xs font-medium", isToday ? "text-pink-700" : "text-ink-muted")}>{isToday ? "Today" : formatDayShort(d)}</p>
                <p className="tnum mt-0.5 flex items-center gap-1.5 font-display text-xl font-semibold leading-none">
                  {d.getDate()}
                  {isToday && <span className="h-1.5 w-1.5 rounded-full bg-pink" aria-hidden />}
                </p>
              </div>
            );
          })}

          {SLOTS.map((slot, row) => (
            <div key={slot.id} className="contents">
              <div className={cx("flex items-start gap-2 px-3 pt-3 text-sm font-medium text-ink-soft", row < SLOTS.length - 1 && "border-b border-forest/10")}>
                <slot.icon size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 text-forest-400" />
                {slot.label}
              </div>
              {days.map((d) => {
                const key = toKey(d);
                return (
                  <div key={key} className={cx("border-l border-forest/10", row < SLOTS.length - 1 && "border-b", isSameDay(d, today) && "bg-cream-50")}>
                    <SlotCell compact entry={plan[key]?.[slot.id]} slot={slot.id} dateKey={key} onOpen={openPicker} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile and tablet: one day at a time */}
      <div className="lg:hidden">
        <div role="tablist" aria-label="Day" className="mb-5 grid grid-cols-7 gap-1 sm:gap-1.5">
          {days.map((d) => {
            const key = toKey(d);
            const active = key === activeDay;
            const count = Object.keys(plan[key] || {}).length;
            const isToday = isSameDay(d, today);
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveDay(key)}
                className={cx(
                  "press flex min-w-0 flex-col items-center gap-0.5 rounded-lg border py-2",
                  active ? "border-forest bg-forest text-cream" : "border-forest/10 bg-cream-50 text-ink hover:border-forest/30"
                )}
              >
                <span className={cx("text-xs", active ? "text-cream/80" : isToday ? "font-medium text-pink-700" : "text-ink-muted")}>{formatDayShort(d)}</span>
                <span className="tnum font-display text-lg font-semibold leading-tight">{d.getDate()}</span>
                <span className="flex h-1.5 gap-0.5" aria-label={`${count} planned`}>
                  {SLOTS.map((s) => (
                    <span key={s.id} className={cx("h-1 w-1 rounded-full", plan[key]?.[s.id] ? (active ? "bg-pink" : "bg-forest") : active ? "bg-cream/25" : "bg-forest/15")} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <h2 className="mb-3 text-xl font-semibold">{isSameDay(activeDate, today) ? "Today" : formatLong(activeDate)}</h2>
        <ul className="flex flex-col gap-4">
          {SLOTS.map((slot) => (
            <li key={slot.id}>
              <p className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink-soft">
                <slot.icon size={16} strokeWidth={1.75} aria-hidden className="text-forest-400" />
                {slot.label}
              </p>
              <SlotCell entry={plan[activeDay]?.[slot.id]} slot={slot.id} dateKey={activeDay} onOpen={openPicker} />
            </li>
          ))}
        </ul>
      </div>

      <MealPickerModal
        open={!!picker}
        onClose={() => setPicker(null)}
        dateKey={picker?.dateKey}
        slot={picker?.slot}
        dateLabel={picker ? formatLong(fromKey(picker.dateKey)) : ""}
        current={picker ? plan[picker.dateKey]?.[picker.slot] : null}
        onPick={pick}
        onRemove={remove}
      />
    </>
  );
}
