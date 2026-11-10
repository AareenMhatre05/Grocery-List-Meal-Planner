import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Check, Pencil, Plus, Search, ShoppingBasket, Trash2, X, ChefHat, CalendarDays, Package } from "lucide-react";
import { PageHeader, Button, ButtonLink, IconButton, Input, Select, Sheet, EmptyState, ErrorNote, Skeleton, Segmented, cx, inputClass } from "../ui/ui";
import { useToast } from "../ui/Toast";
import { BasketSpot } from "../ui/Spots";
import { useStoredState, KEYS } from "../lib/storage";
import { CATEGORIES, UNITS, categorize, categoryOf, makeItem } from "../lib/grocery";
import { commodityFor, referenceCommodityForProduct, useMarketPrices, formatInr, formatPerKg } from "../lib/marketPrices";
import { PriceLine, PriceDetails, MarketSummary, estimateFor, FreshnessMark } from "./MarketPrice";

const EASE = [0.23, 1, 0.32, 1];
const STRIKE_PATH = "M2 7.5c18-3.2 34 2.2 52-.6S88 4.2 106 6.4s30 1.4 48-.2 32-1 44 .9";

function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="press group/check -m-2 flex h-10 w-10 shrink-0 items-center justify-center rounded"
    >
      <span
        className={cx(
          "flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border-[1.5px] transition-[background-color,border-color] duration-fast ease-out",
          checked ? "border-pink bg-pink text-forest-900" : "border-forest/40 bg-cream-50 group-hover/check:border-forest"
        )}
      >
        <Check size={14} strokeWidth={3} aria-hidden className={cx("transition-[opacity,transform] duration-fast ease-out", checked ? "scale-100 opacity-100" : "scale-75 opacity-0")} />
      </span>
    </button>
  );
}

function ItemRow({ item, struck, onToggle, onSave, onRemove, price }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  const [showPrice, setShowPrice] = useState(false);
  const nameRef = useRef(null);
  const reduce = useReducedMotion();
  // price is undefined for items with no market commodity (packaged or not traded in mandis)
  const priced = price && !item.done && !struck;
  const estimate = priced ? estimateFor(item, price.entry) : null;
  const detailsId = `price-${item.id}`;

  useEffect(() => {
    if (editing) nameRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(item);
    setEditing(true);
  };
  const save = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    onSave({ ...draft, name: draft.name.trim() });
    setEditing(false);
  };

  const amount = [item.qty, item.unit].filter(Boolean).join(" ");

  return (
    <motion.li
      layout={reduce ? false : "position"}
      layoutId={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ layout: { duration: 0.3, ease: EASE }, opacity: { duration: 0.16 } }}
      className="border-b border-forest/[0.08] last:border-b-0"
    >
      {editing ? (
        <form onSubmit={save} onKeyDown={(e) => e.key === "Escape" && setEditing(false)} className="grid grid-cols-[1fr_4.5rem_5.5rem] gap-2 py-3 sm:grid-cols-[1fr_5rem_6rem_10rem_auto]">
          <label className="sr-only" htmlFor={`name-${item.id}`}>Item</label>
          <Input id={`name-${item.id}`} ref={nameRef} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="col-span-3 sm:col-span-1" />
          <label className="sr-only" htmlFor={`qty-${item.id}`}>Quantity</label>
          <Input id={`qty-${item.id}`} value={draft.qty} inputMode="decimal" onChange={(e) => setDraft({ ...draft, qty: e.target.value })} placeholder="Qty" />
          <label className="sr-only" htmlFor={`unit-${item.id}`}>Unit</label>
          <Input id={`unit-${item.id}`} list="units" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="Unit" />
          <label className="sr-only" htmlFor={`cat-${item.id}`}>Category</label>
          <Select id={`cat-${item.id}`} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
          <div className="col-span-3 flex justify-end gap-2 sm:col-span-1">
            <Button variant="ghost" size="md" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      ) : (
        <div className="group flex min-h-[3.25rem] items-center gap-3 py-1.5">
          <Checkbox checked={struck} onChange={() => onToggle(item)} label={`${item.name}${amount ? `, ${amount}` : ""}`} />
          <div className="min-w-0 flex-1">
            <span className="relative inline-block max-w-full">
              <span className={cx("block truncate transition-colors duration-base ease-out", struck ? "text-ink-muted" : "text-ink")}>{item.name}</span>
              {/* Signature: an ink stroke drawn across the item when it goes in the basket */}
              <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden data-on={struck} className="strike-ink pointer-events-none absolute -left-1 top-1/2 h-3 w-[calc(100%+0.5rem)] -translate-y-1/2 overflow-visible">
                <path d={STRIKE_PATH} fill="none" stroke="#FF3EA5" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>
            {item.source && !struck && <p className="truncate text-xs text-ink-muted">For {item.source}</p>}
            {priced && (
              <PriceLine
                entry={price.entry}
                loading={price.loading}
                failed={price.failed}
                open={showPrice}
                onToggle={() => setShowPrice((v) => !v)}
                detailsId={detailsId}
              />
            )}
          </div>
          {(amount || estimate != null) && (
            <span className="flex shrink-0 flex-col items-end">
              {amount && <span className={cx("tnum text-sm", struck ? "text-ink-muted" : "text-ink-soft")}>{amount}</span>}
              {estimate != null && (
                <span className="tnum text-xs text-ink-muted" title="Estimated at the wholesale mandi price">
                  ≈ {formatInr(estimate, estimate < 100)} est.
                </span>
              )}
            </span>
          )}
          {/* Fixed-width action slot so quantities align in every state, including mid-check */}
          <div className="flex w-16 shrink-0 items-center justify-end opacity-100 transition-opacity duration-fast sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            {struck ? <span className="h-8 w-8" aria-hidden /> : <IconButton icon={Pencil} size="sm" label={`Edit ${item.name}`} onClick={startEdit} />}
            <IconButton icon={Trash2} size="sm" tone="danger" label={`Remove ${item.name}`} onClick={() => onRemove(item)} />
          </div>
        </div>
      )}
      {!editing && priced && showPrice && price.entry?.data && <PriceDetails entry={price.entry} item={item} id={detailsId} />}
    </motion.li>
  );
}

function AddItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const nameRef = useRef(null);
  const guessed = name.trim() ? categorize(name) : "";

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(makeItem({ name, qty, unit, category: category || guessed }));
    setName("");
    setQty("");
    setUnit("");
    setCategory("");
    nameRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-[1fr_4.5rem_5.5rem] gap-2 md:grid-cols-[1fr_5.5rem_6.5rem_11rem_auto]" aria-label="Add an item">
      <div className="col-span-3 md:col-span-1">
        <label htmlFor="new-item" className="sr-only">Item</label>
        <Input id="new-item" ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item, e.g. paneer" autoComplete="off" />
      </div>
      <div>
        <label htmlFor="new-qty" className="sr-only">Quantity</label>
        <Input id="new-qty" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" inputMode="decimal" />
      </div>
      <div>
        <label htmlFor="new-unit" className="sr-only">Unit</label>
        <input id="new-unit" list="units" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" className={inputClass} />
      </div>
      <div className="col-span-3 flex gap-2 md:col-span-2">
        <label htmlFor="new-cat" className="sr-only">Category</label>
        <Select id="new-cat" value={category || guessed || ""} onChange={(e) => setCategory(e.target.value)} className="min-w-0 flex-1">
          {!guessed && !category && <option value="">Category</option>}
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
        <Button type="submit" icon={Plus} disabled={!name.trim()}>Add</Button>
      </div>
      <datalist id="units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
    </form>
  );
}

function ChecklistTab({ list, setList }) {
  const [pending, setPending] = useState({}); // id -> true while the strike draws before the item moves
  const toast = useToast();
  const reduce = useReducedMotion();

  const remaining = list.filter((i) => !i.done);
  const basket = list.filter((i) => i.done);
  const total = list.length;

  const groups = useMemo(
    () =>
      CATEGORIES.map((c) => ({ ...c, items: remaining.filter((i) => (categoryOf(i.category).id) === c.id) })).filter((g) => g.items.length),
    [remaining]
  );

  // Mandi prices (data.gov.in) for the loose staples still to buy
  const commodities = useMemo(() => remaining.map(commodityFor), [remaining]);
  const market = useMarketPrices(commodities);
  const priceFor = (item) => {
    const c = commodityFor(item);
    if (!c) return undefined;
    return market.prices[c] || null;
  };
  const rowPrice = (item) => {
    const c = commodityFor(item);
    if (!c) return undefined;
    return { entry: market.prices[c] || null, loading: market.loading, failed: market.failed.includes(c) };
  };

  const add = (item) => setList((l) => [...l, item]);
  const save = (item) => setList((l) => l.map((i) => (i.id === item.id ? item : i)));
  const remove = (item) => {
    setList((l) => l.filter((i) => i.id !== item.id));
    toast(`${item.name} removed`);
  };
  const toggle = (item) => {
    if (item.done) {
      setList((l) => l.map((i) => (i.id === item.id ? { ...i, done: false } : i)));
      return;
    }
    // Let the stroke draw in place, then file the item under "In the basket"
    setPending((p) => ({ ...p, [item.id]: true }));
    setTimeout(() => {
      setList((l) => l.map((i) => (i.id === item.id ? { ...i, done: true } : i)));
      setPending((p) => {
        const { [item.id]: _, ...rest } = p;
        return rest;
      });
    }, reduce ? 0 : 420);
  };
  const clearBasket = () => {
    const n = basket.length;
    setList((l) => l.filter((i) => !i.done));
    toast(`${n} ${n === 1 ? "item" : "items"} cleared from the basket`);
  };

  const pct = total ? Math.round((basket.length / total) * 100) : 0;

  return (
    // minmax(0,1fr): a long mandi name must truncate, never widen the column past the screen
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <Sheet className="p-4 sm:p-5">
        <AddItemForm onAdd={add} />
      </Sheet>

      {total === 0 ? (
        <EmptyState
          art={<BasketSpot />}
          title="Your list is empty"
          action={
            <>
              <ButtonLink to="/meals" variant="secondary" icon={ChefHat}>Pick a recipe</ButtonLink>
              <ButtonLink to="/planner" variant="secondary" icon={CalendarDays}>Open the week planner</ButtonLink>
            </>
          }
        >
          Type an item above, or add a recipe's ingredients from its page. Anything already in your pantry is left off.
        </EmptyState>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Shopping progress">
              <div className="h-full origin-left rounded-full bg-forest transition-transform duration-300 ease-out" style={{ transform: `scaleX(${pct / 100})` }} />
            </div>
            <p className="tnum shrink-0 text-sm text-ink-soft">
              <span className="font-semibold text-ink">{basket.length}</span> of {total} in the basket
            </p>
          </div>

          <MarketSummary items={list} priceFor={priceFor} loading={market.loading} error={market.error} onRetry={market.retry} />

          <LayoutGroup>
            {remaining.length === 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-forest/10 bg-cream-50 px-5 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink text-forest-900"><Check size={16} strokeWidth={2.5} aria-hidden /></span>
                <p className="text-ink">Everything is in the basket. Clear it when you're home.</p>
              </div>
            )}

            {groups.map((g) => (
              <section key={g.id} aria-labelledby={`cat-h-${g.id}`}>
                <h2 id={`cat-h-${g.id}`} className="mb-1 flex items-center gap-2 font-sans text-sm font-semibold text-ink-soft">
                  <g.icon size={16} strokeWidth={1.75} aria-hidden className="text-forest-400" />
                  {g.label}
                  <span className="tnum font-normal text-ink-muted">{g.items.length}</span>
                </h2>
                <ul className="rounded-xl border border-forest/10 bg-cream-50 px-4">
                  <AnimatePresence initial={false}>
                    {g.items.map((item) => (
                      <ItemRow key={item.id} item={item} struck={!!pending[item.id]} onToggle={toggle} onSave={save} onRemove={remove} price={rowPrice(item)} />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}

            {basket.length > 0 && (
              <section aria-labelledby="basket-h" className="pt-2">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h2 id="basket-h" className="flex items-center gap-2 font-sans text-sm font-semibold text-ink-soft">
                    <ShoppingBasket size={16} strokeWidth={1.75} aria-hidden className="text-forest-400" />
                    In the basket
                    <span className="tnum font-normal text-ink-muted">{basket.length}</span>
                  </h2>
                  <Button variant="ghost" size="sm" icon={X} onClick={clearBasket}>Clear basket</Button>
                </div>
                <ul className="rounded-xl border border-forest/10 bg-cream-100/70 px-4">
                  <AnimatePresence initial={false}>
                    {basket.map((item) => (
                      <ItemRow key={item.id} item={item} struck onToggle={toggle} onSave={save} onRemove={remove} />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            )}
          </LayoutGroup>
        </>
      )}
    </div>
  );
}

// OpenFoodFacts product search, kept from the original grocery page. Scoped to India (the
// product's region); a search with no Indian results falls back to the global catalogue.
const OFF = (q, size, india = true) =>
  `https://world.openfoodfacts.net/api/v2/search?categories_tags_en=${encodeURIComponent(q)}${india ? "&countries_tags_en=india" : ""}&fields=code,product_name,brands,image_url,quantity,categories_tags_en&page_size=${size}`;
const DEFAULTS = ["rice", "milk", "bread", "paneer", "atta", "ghee"];
const productName = (p) => p.product_name?.trim() || [p.brands, p.quantity].filter(Boolean).join(" ") || "Unnamed product";

function ProductCard({ product: p, reference, onAdd }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const add = () => {
    onAdd(p);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  const meta = [p.brands, p.quantity].filter(Boolean).join(" · ");
  const d = reference?.entry?.data;

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-forest/10 bg-cream-50">
      <div className="relative aspect-[4/3] border-b border-forest/10 bg-white">
        {p.image_url && !imgFailed ? (
          <img src={p.image_url} alt="" loading="lazy" onError={() => setImgFailed(true)} className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] object-contain" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-forest-300">
            <Package size={28} strokeWidth={1.5} aria-hidden />
            <span className="text-xs text-ink-muted">No photo</span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{productName(p)}</p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">{meta || "No brand listed"}</p>

        {/* Price area: a fixed slot so cards line up whether or not a reference exists */}
        <div className="mt-3 min-h-[3.25rem] border-t border-dashed border-forest/15 pt-2 text-xs">
          <p className="text-ink-soft">
            <span className="font-medium text-ink">Retail price</span> not listed
          </p>
          {reference &&
            (d ? (
              <p className="mt-0.5 text-ink-muted">
                Loose {reference.commodity.toLowerCase()} at mandi{" "}
                <span className="tnum font-semibold text-ink-soft">{formatPerKg(d.modalPrice)}</span> · <FreshnessMark arrivalDate={d.arrivalDate} />
                <span className="block">Market reference, not this pack's price</span>
              </p>
            ) : reference.loading ? (
              <p className="mt-0.5 text-ink-muted">Checking mandi reference…</p>
            ) : null)}
        </div>

        <Button
          variant={added ? "primary" : "secondary"}
          size="sm"
          icon={added ? Check : Plus}
          className="mt-3 w-full"
          onClick={add}
          aria-live="polite"
        >
          {added ? "Added to list" : "Add to list"}
        </Button>
      </div>
    </li>
  );
}

function ProductsTab({ setList }) {
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, items: [], error: null, label: "Everyday staples" });
  const toast = useToast();

  const load = async (query) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      if (query) {
        let res = await axios.get(OFF(query, 20));
        let label = `Results for “${query}” in India`;
        if (!res.data.products?.length) {
          res = await axios.get(OFF(query, 20, false));
          label = `No Indian results for “${query}”, showing all countries`;
        }
        setState({ loading: false, items: res.data.products || [], error: null, label });
      } else {
        const all = await Promise.all(DEFAULTS.map((q) => axios.get(OFF(q, 5))));
        setState({ loading: false, items: all.flatMap((r) => r.data.products || []), error: null, label: "Everyday staples in India" });
      }
    } catch {
      setState((s) => ({ ...s, loading: false, items: [], error: "Couldn't reach Open Food Facts. Check your connection." }));
    }
  };

  useEffect(() => {
    load("");
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (search.trim()) load(search.trim());
  };

  // Market references for the loose staples these products are made of (rice, sugar, ghee…)
  const refCommodities = useMemo(() => state.items.map(referenceCommodityForProduct), [state.items]);
  const refPrices = useMarketPrices(refCommodities);

  const addProduct = (p) => {
    const base = productName(p);
    const name = p.quantity && !base.includes(p.quantity) ? `${base} (${p.quantity})` : base;
    // Packaged products are marked so they never borrow a mandi price on the list
    setList((l) => [...l, makeItem({ name, qty: "1", unit: "pack", kind: "product" })]);
    toast(`${base} added to your list`);
  };

  return (
    <div className="grid gap-5">
      <form onSubmit={submit} role="search" className="flex max-w-xl gap-2">
        <label htmlFor="product-search" className="sr-only">Search packaged products</label>
        <div className="relative flex-1">
          <Search size={16} strokeWidth={1.75} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input id="product-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, e.g. rice, milk" className="pl-9" autoComplete="off" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <p className="text-sm text-ink-muted">{state.label} · from Open Food Facts</p>

      {state.error ? (
        <ErrorNote onRetry={() => load(search.trim())}>{state.error}</ErrorNote>
      ) : state.loading ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <li key={i}><Skeleton className="aspect-[4/5] rounded-xl" /></li>)}
        </ul>
      ) : state.items.length === 0 ? (
        <EmptyState icon={Package} title="No products found">Try a category word such as “rice”, “biscuits” or “juice”.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {state.items.map((p, i) => {
            const ref = referenceCommodityForProduct(p);
            return <ProductCard key={p.code || i} product={p} reference={ref ? { commodity: ref, entry: refPrices.prices[ref] || null, loading: refPrices.loading } : null} onAdd={addProduct} />;
          })}
        </ul>
      )}
    </div>
  );
}

function GroceryList() {
  const [list, setList] = useStoredState(KEYS.grocery, []);
  const [tab, setTab] = useState("list");
  const remaining = list.filter((i) => !i.done).length;

  return (
    <>
      {/* Header and toggle keep one width on both tabs so the toggle never moves under the pointer */}
      <div className="max-w-3xl">
      <PageHeader
        title="Grocery list"
        description={
          list.length
            ? `${remaining} ${remaining === 1 ? "item" : "items"} still to buy. Items in your pantry are left off when you add a recipe.`
            : "Everything you need for the week, grouped the way a shop is laid out."
        }
        actions={
          <Segmented
            label="View"
            value={tab}
            onChange={setTab}
            options={[
              { value: "list", label: "My list" },
              { value: "products", label: "Find products" },
            ]}
          />
        }
      />
      </div>
      {tab === "list" ? (
        <div className="max-w-3xl">
          <ChecklistTab list={list} setList={setList} />
        </div>
      ) : (
        <ProductsTab setList={setList} />
      )}
      <p className="mt-10 max-w-3xl text-sm text-ink-muted">
        Your list is saved on this device. <Link to="/pantry" className="font-medium text-ink underline">Update your pantry</Link> so recipes know what you already have.
      </p>
    </>
  );
}

export default GroceryList;
