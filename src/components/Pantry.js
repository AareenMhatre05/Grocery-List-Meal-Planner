import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, ChefHat, X, ArrowRight } from "lucide-react";
import { PageHeader, Button, ButtonLink, Input, Sheet, EmptyState, IconButton } from "../ui/ui";
import { useToast } from "../ui/Toast";
import { PantrySpot } from "../ui/Spots";
import { useStoredState, KEYS } from "../lib/storage";
import { CATEGORIES, categorize } from "../lib/grocery";

const QUICK = ["Rice", "Atta", "Onion", "Tomato", "Potato", "Paneer", "Eggs", "Milk", "Toor dal", "Garlic"];

function Pantry() {
  const [pantry, setPantry] = useStoredState(KEYS.pantry, []);
  const [item, setItem] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const toast = useToast();
  const reduce = useReducedMotion();

  const has = (name) => pantry.some((p) => p.toLowerCase() === name.trim().toLowerCase());

  const addItem = (value = item) => {
    const name = value.trim();
    if (!name) return;
    if (has(name)) {
      setError(`${name} is already in your pantry`);
      return;
    }
    setPantry((p) => [...p, name]);
    setItem("");
    setError("");
    inputRef.current?.focus();
  };

  const removeItem = (name) => {
    setPantry((p) => p.filter((i) => i !== name));
    toast(`${name} removed from your pantry`);
  };

  const groups = useMemo(
    () => CATEGORIES.map((c) => ({ ...c, items: pantry.filter((p) => categorize(p) === c.id) })).filter((g) => g.items.length),
    [pantry]
  );
  const suggestions = QUICK.filter((q) => !has(q)).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Pantry"
        description="What you already have at home. Recipes are suggested from these, and they're left off your grocery list."
        actions={
          pantry.length > 0 && (
            <ButtonLink to="/meals" icon={ChefHat}>
              Find recipes
            </ButtonLink>
          )
        }
      />

      <Sheet className="mb-8 p-4 sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addItem();
          }}
          className="flex gap-2"
        >
          <label htmlFor="pantry-item" className="sr-only">Pantry item</label>
          <Input
            id="pantry-item"
            ref={inputRef}
            value={item}
            onChange={(e) => {
              setItem(e.target.value);
              setError("");
            }}
            placeholder="Add what you have, e.g. basmati rice"
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "pantry-error" : undefined}
          />
          <Button type="submit" icon={Plus} disabled={!item.trim()}>Add</Button>
        </form>
        {error && <p id="pantry-error" className="mt-2 text-sm text-danger">{error}</p>}
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-muted">Quick add</span>
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => addItem(s)} className="press inline-flex h-8 items-center gap-1 rounded-full border border-forest/15 px-3 text-sm text-ink-soft hover:border-forest/35 hover:text-ink">
                <Plus size={14} strokeWidth={1.75} aria-hidden />
                {s}
              </button>
            ))}
          </div>
        )}
      </Sheet>

      {pantry.length === 0 ? (
        <EmptyState art={<PantrySpot />} title="Your pantry is empty">
          Add a few things you have at home, like rice, onions or paneer. Recipe suggestions start from the first item.
        </EmptyState>
      ) : (
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {groups.map((g) => (
            <section key={g.id} aria-labelledby={`pantry-${g.id}`}>
              <h2 id={`pantry-${g.id}`} className="mb-1 flex items-center gap-2 font-sans text-sm font-semibold text-ink-soft">
                <g.icon size={16} strokeWidth={1.75} aria-hidden className="text-forest-400" />
                {g.label}
                <span className="tnum font-normal text-ink-muted">{g.items.length}</span>
              </h2>
              <ul className="rounded-xl border border-forest/10 bg-cream-50 px-4">
                <AnimatePresence initial={false}>
                  {g.items.map((name) => (
                    <motion.li
                      key={name}
                      layout={reduce ? false : "position"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.18 }}
                      className="group flex min-h-[3rem] items-center gap-3 border-b border-forest/[0.08] last:border-b-0"
                    >
                      <span className="flex-1 truncate text-ink">{name}</span>
                      <Link
                        to={`/meals?ingredient=${encodeURIComponent(name)}`}
                        className="flex items-center gap-1 rounded text-sm text-ink-soft opacity-100 transition-opacity duration-fast hover:text-ink hover:underline sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                      >
                        Recipes
                        <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
                        <span className="sr-only">with {name}</span>
                      </Link>
                      <IconButton icon={X} size="sm" tone="danger" label={`Remove ${name}`} onClick={() => removeItem(name)} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

export default Pantry;
