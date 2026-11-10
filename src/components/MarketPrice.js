import { Info, RefreshCw } from "lucide-react";
import { cx } from "../ui/ui";
import {
  MARKET_SOURCE,
  hasMarketKey,
  freshness,
  parseArrival,
  formatPerKg,
  formatPerQuintal,
  formatInr,
  formatArrival,
  perKg,
  quantityInKg,
} from "../lib/marketPrices";

// Filled dot: reported today or yesterday. Hollow ring: an older observation.
export function FreshnessMark({ arrivalDate, onForest = false }) {
  const f = freshness(parseArrival(arrivalDate));
  return (
    <span className="inline-flex items-center gap-1" title={f.current ? "Current market report" : "Older market report"}>
      <span
        aria-hidden="true"
        className={cx(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          f.current ? (onForest ? "bg-cream" : "bg-forest") : onForest ? "border border-cream/70" : "border border-forest/60"
        )}
      />
      <span>{f.label}</span>
      <span className="sr-only">{f.current ? "(current report)" : "(older report)"}</span>
    </span>
  );
}

// Estimated cost of a list item at the market reference price, only when the
// quantity is a weight. Returns null when it cannot be computed honestly.
export function estimateFor(item, entry) {
  if (!entry?.data) return null;
  const kg = quantityInKg(item.qty, item.unit);
  if (kg == null) return null;
  return kg * perKg(entry.data.modalPrice);
}

// The compact line under an item's name
export function PriceLine({ entry, loading, failed, open, onToggle, detailsId }) {
  if (loading && !entry) {
    return (
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted" aria-live="polite">
        <span className="skeleton h-2 w-14" />
        Checking mandi price
      </p>
    );
  }
  if (!entry) {
    return failed ? <p className="mt-0.5 text-xs text-ink-muted">Market price unavailable right now</p> : null;
  }
  if (!entry.data) {
    return <p className="mt-0.5 text-xs text-ink-muted">No mandi reported this item today</p>;
  }
  const d = entry.data;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={detailsId}
      className="group/price mt-0.5 flex w-full min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded text-left text-xs text-ink-muted hover:text-ink sm:flex-nowrap"
    >
      <span className="tnum shrink-0 font-semibold text-ink-soft group-hover/price:text-ink">{formatPerKg(d.modalPrice)}</span>
      <span className="shrink-0">market ref</span>
      {/* The mandi name is long; on phones it lives in the details panel */}
      <span aria-hidden="true" className="hidden sm:inline">·</span>
      <span className="hidden min-w-0 truncate sm:inline">{d.market}, {d.state}</span>
      <span aria-hidden="true" className="hidden sm:inline">·</span>
      <span className="shrink-0">
        <FreshnessMark arrivalDate={d.arrivalDate} />
      </span>
      {entry.stale && <span className="shrink-0">(saved copy)</span>}
      <Info size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 opacity-60 group-hover/price:opacity-100" />
      <span className="sr-only">{open ? "Hide price details" : "Show price details"}</span>
    </button>
  );
}

// The expanded explanation under a row
export function PriceDetails({ entry, item, id }) {
  const d = entry.data;
  const kg = quantityInKg(item.qty, item.unit);
  const estimate = kg != null ? kg * perKg(d.modalPrice) : null;
  const place = [d.market, d.district, d.state].filter(Boolean).join(", ");
  return (
    <div id={id} className="mb-3 ml-[2.75rem] rounded-lg border border-forest/10 bg-cream-100/80 px-4 py-3 text-sm">
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5">
        <dt className="text-ink-muted">Modal price</dt>
        <dd className="tnum text-ink">
          <span className="font-semibold">{formatPerQuintal(d.modalPrice)}</span>
          <span className="text-ink-soft"> = {formatPerKg(d.modalPrice)}</span>
        </dd>
        <dt className="text-ink-muted">Min to max</dt>
        <dd className="tnum text-ink">
          {formatInr(d.minPrice)} to {formatInr(d.maxPrice)} per quintal
          <span className="text-ink-soft"> ({formatPerKg(d.minPrice)} to {formatPerKg(d.maxPrice)})</span>
        </dd>
        <dt className="text-ink-muted">Mandi</dt>
        <dd className="text-ink">{place}</dd>
        {(d.variety || d.grade) && (
          <>
            <dt className="text-ink-muted">Variety</dt>
            <dd className="text-ink">{[d.variety, d.grade && d.grade !== "FAQ" ? d.grade : null].filter(Boolean).join(", ")}</dd>
          </>
        )}
        <dt className="text-ink-muted">Reported</dt>
        <dd className="text-ink">
          {formatArrival(d.arrivalDate)} · <FreshnessMark arrivalDate={d.arrivalDate} />
          {entry.stale && <span className="text-ink-soft"> · saved copy, data.gov.in could not be reached</span>}
        </dd>
        <dt className="text-ink-muted">Estimate</dt>
        <dd className="tnum text-ink">
          {estimate != null ? (
            <>
              {item.qty} {item.unit} at {formatPerKg(d.modalPrice)} ≈ <span className="font-semibold">{formatInr(estimate, estimate < 100)}</span>
            </>
          ) : (
            <span className="text-ink-soft">Not calculated: the mandi price is per kg, so set the quantity in g or kg</span>
          )}
        </dd>
      </dl>
      <p className="mt-3 border-t border-forest/10 pt-2 text-xs leading-relaxed text-ink-muted">
        {d.marketsReporting > 1
          ? `Shown: the market with the median modal price of the ${d.marketsReporting} mandis that reported ${d.commodity} on this date (modal prices ranged ${formatPerKg(d.modalLow)} to ${formatPerKg(d.modalHigh)}). `
          : `Only one mandi reported ${d.commodity} on this date. `}
        Wholesale mandi price from {MARKET_SOURCE.name}, reported in {MARKET_SOURCE.unit}. This is a market reference, not a shop price; retail prices are usually higher.
      </p>
    </div>
  );
}

// Summary above the list: an estimate only from items that have both a market price and a weight
export function MarketSummary({ items, priceFor, loading, error, onRetry }) {
  if (!hasMarketKey) {
    return (
      <p className="rounded-lg border border-dashed border-forest/20 px-4 py-3 text-sm text-ink-muted">
        Market prices are off. Add <code className="rounded bg-forest/[0.06] px-1">REACT_APP_DATAGOV_KEY</code> to <code className="rounded bg-forest/[0.06] px-1">.env.local</code> and restart the app to see mandi prices from data.gov.in.
      </p>
    );
  }
  const remaining = items.filter((i) => !i.done);
  const rows = remaining.map((i) => ({ item: i, entry: priceFor(i) }));
  const withCommodity = rows.filter((r) => r.entry !== undefined);
  const estimates = rows.map((r) => estimateFor(r.item, r.entry)).filter((n) => n != null);
  const total = estimates.reduce((a, b) => a + b, 0);
  const priced = rows.filter((r) => r.entry?.data);
  const needWeight = priced.length - estimates.length;
  // undefined: no mandi commodity (packaged / not traded); null: not loaded yet or the API failed;
  // { data: null }: a commodity no mandi reported on the latest date
  const noPrice = rows.filter((r) => r.entry === undefined).length;
  const notReported = rows.filter((r) => r.entry && !r.entry.data).length;
  const dates = [...new Set(priced.map((r) => r.entry.data.arrivalDate))];
  const anyOld = priced.some((r) => !freshness(parseArrival(r.entry.data.arrivalDate)).current);

  if (!remaining.length) return null;

  return (
    <section aria-labelledby="estimate-h" className="rounded-xl border border-forest/10 bg-cream-50 px-5 py-4 shadow-sheet">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="estimate-h" className="font-sans text-sm font-semibold text-ink-soft">
          Estimated market value of items still to buy
        </h2>
        {loading && <span className="text-xs text-ink-muted" aria-live="polite">Updating mandi prices…</span>}
      </div>
      {estimates.length ? (
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className="tnum font-display text-3xl font-semibold leading-tight text-ink">≈ {formatInr(total)}</span>
          <span className="tnum text-sm text-ink-soft">
            from {estimates.length} of {remaining.length} {remaining.length === 1 ? "item" : "items"}
          </span>
        </p>
      ) : (
        <p className="mt-1 text-ink-soft">{loading && withCommodity.length ? "Checking prices…" : "No estimate yet"}</p>
      )}
      <ul className="mt-2 space-y-0.5 text-xs text-ink-muted">
        {priced.length > 0 && (
          <li>
            Wholesale mandi prices (modal), {MARKET_SOURCE.name}
            {dates.length === 1 ? `, reported ${formatArrival(dates[0])}` : ""}
            {anyOld ? ". Some reports are older; open an item to see its date" : ""}. Shop prices are usually higher.
          </li>
        )}
        {needWeight > 0 && (
          <li>
            {needWeight} priced {needWeight === 1 ? "item needs" : "items need"} a quantity in g or kg to be included.
          </li>
        )}
        {noPrice > 0 && (
          <li>
            {noPrice} {noPrice === 1 ? "item has" : "items have"} no market price (packaged products and items mandis don't trade) and {noPrice === 1 ? "is" : "are"} left out, not guessed.
          </li>
        )}
        {notReported > 0 && (
          <li>
            {notReported} {notReported === 1 ? "item was" : "items were"} not reported by any mandi on the latest date.
          </li>
        )}
      </ul>
      {error && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-danger" role="status">
          {error}
          <button type="button" onClick={onRetry} className="press inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium underline hover:bg-danger-soft">
            <RefreshCw size={12} strokeWidth={2} aria-hidden="true" />
            Try again
          </button>
        </p>
      )}
    </section>
  );
}
