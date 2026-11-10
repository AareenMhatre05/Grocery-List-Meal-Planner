import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// Mandi (wholesale market) prices from data.gov.in:
// "Current Daily Price of Various Commodities from Various Markets (Mandi)",
// Ministry of Agriculture and Farmers Welfare (Agmarknet).
//
// Facts established from the live API (Nov 2026):
// - fields: state, district, market, commodity, variety, grade, arrival_date (dd/mm/yyyy),
//   min_price, max_price, modal_price
// - prices are rupees per quintal (100 kg), Agmarknet's reporting unit; the API itself
//   does not repeat the unit, so it is stated here and in the UI
// - the commodity filter is fuzzy ("Masur Dal" also returns moong and urad dal), so records
//   are re-filtered by exact commodity name before use
// - many mandis report each commodity; their modal prices vary widely, so we show the
//   market whose modal price is the median, plus the full range

const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";
const KEY = process.env.REACT_APP_DATAGOV_KEY || "";
const CACHE_KEY = "marketPriceCache";
const TTL_MS = 6 * 60 * 60 * 1000; // the dataset refreshes daily

export const MARKET_SOURCE = {
  name: "Agmarknet via data.gov.in",
  dataset: "Current Daily Price of Various Commodities from Various Markets (Mandi)",
  unit: "₹ per quintal (100 kg)",
};

export const hasMarketKey = Boolean(KEY);

// Grocery names (English and common Hindi) that map to an exact Agmarknet commodity.
// Only unbranded staples traded in mandis. Matching is on the whole item name, so
// "turmeric powder", "basmati rice" or a branded product never borrow a mandi price.
const COMMODITIES = [
  ["Onion", ["onion", "pyaz", "pyaaz", "kanda"]],
  ["Potato", ["potato", "aloo", "alu"]],
  ["Tomato", ["tomato", "tamatar"]],
  ["Garlic", ["garlic", "lahsun", "lehsun"]],
  ["Ginger(Green)", ["ginger", "adrak", "fresh ginger"]],
  ["Green Chilli", ["green chilli", "green chili", "green chillies", "hari mirch", "green chilly"]],
  ["Coriander(Leaves)", ["coriander", "coriander leaves", "dhania", "dhaniya", "cilantro", "fresh coriander"]],
  ["Cauliflower", ["cauliflower", "gobi", "phool gobi"]],
  ["Cabbage", ["cabbage", "patta gobi", "band gobi"]],
  ["Brinjal", ["brinjal", "baingan", "eggplant", "aubergine"]],
  ["Carrot", ["carrot", "gajar"]],
  ["Banana", ["banana", "kela"]],
  ["Apple", ["apple", "seb"]],
  ["Spinach", ["spinach", "palak"]],
  ["Lemon", ["lemon", "nimbu"]],
  ["Lime", ["lime"]],
  ["Capsicum", ["capsicum", "shimla mirch", "bell pepper", "green capsicum"]],
  ["Beetroot", ["beetroot", "beet", "chukandar"]],
  ["Cucumbar(Kheera)", ["cucumber", "kheera", "khira"]],
  ["Bhindi(Ladies Finger)", ["bhindi", "okra", "ladies finger", "lady finger"]],
  ["Mint(Pudina)", ["mint", "pudina", "mint leaves"]],
  ["Methi(Leaves)", ["methi", "fenugreek leaves", "methi leaves"]],
  ["Peas Wet", ["green peas", "peas", "matar", "fresh peas"]],
  ["Mushroom", ["mushroom", "button mushroom"]],
  ["Sweet Potato", ["sweet potato", "shakarkandi"]],
  ["Pomegranate", ["pomegranate", "anar"]],
  ["Papaya", ["papaya", "papita"]],
  ["Grapes", ["grape", "grapes", "angoor"]],
  ["Orange", ["orange", "santra"]],
  ["Guava", ["guava", "amrood"]],
  ["Pineapple", ["pineapple", "ananas"]],
  ["Coconut", ["coconut", "nariyal"]],
  ["Rice", ["rice", "chawal", "loose rice"]],
  ["Masur Dal", ["masoor dal", "masur dal", "red lentils"]],
  ["Red gram split/Arhar dal/Tur dal", ["toor dal", "tur dal", "arhar dal", "tuvar dal"]],
  ["Green Gram Dal(Moong Dal)", ["moong dal", "mung dal"]],
  ["Black Gram Dal(Urd Dal)", ["urad dal", "urd dal"]],
  ["Bengal Gram Dal(Chana Dal)", ["chana dal"]],
  ["Sugar", ["sugar", "cheeni", "chini"]],
  ["Ghee", ["ghee", "desi ghee"]],
  ["Gur(Jaggery)", ["jaggery", "gur", "gud"]],
  ["Mustard Oil", ["mustard oil", "sarson oil", "sarson ka tel"]],
];

const norm = (s = "") =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ALIAS_INDEX = new Map();
COMMODITIES.forEach(([commodity, aliases]) => aliases.forEach((a) => ALIAS_INDEX.set(norm(a), commodity)));

// The whole name must equal an alias; only plural endings are forgiven
// ("tomatoes", "rices", "jaggeries", "lemons").
function lookup(name) {
  const n = norm(name);
  if (!n) return null;
  const candidates = [n, n.replace(/ies$/, "y"), n.replace(/oes$/, "o"), n.replace(/es$/, ""), n.replace(/s$/, "")];
  for (const c of candidates) if (ALIAS_INDEX.has(c)) return ALIAS_INDEX.get(c);
  return null;
}

// Exact Agmarknet commodity for a grocery list item, or null. Packaged products never match.
export function commodityFor(item) {
  if (!item || item.kind === "product") return null;
  return lookup(item.name);
}

// For a packaged product, the loose commodity it is made of, used only as a separately
// labelled reference, never as its price. Both must agree: a category tag maps to the
// commodity AND the product's own name contains one of that commodity's names. This keeps
// poha (flattened rice) and murmura (puffed rice), which Open Food Facts files under rice
// categories, from showing a loose-rice reference.
export function referenceCommodityForProduct(product) {
  const name = norm(product?.product_name || "");
  if (!name) return null;
  const words = ` ${name} `;
  for (const tag of product?.categories_tags_en || []) {
    const c = lookup(tag);
    if (!c) continue;
    const aliases = COMMODITIES.find(([commodity]) => commodity === c)?.[1] || [];
    if (aliases.some((a) => words.includes(` ${norm(a)} `))) return c;
  }
  return null;
}

// ---------- quantities ----------

export function parseQty(q) {
  const s = String(q ?? "").trim().replace(",", ".");
  if (!s) return null;
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const special = { "½": 0.5, "¼": 0.25, "¾": 0.75 };
  if (special[s]) return special[s];
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Mandi prices are by weight. Only weight units convert; volume, pieces, bunches and packs do not.
export function quantityInKg(qty, unit) {
  const n = parseQty(qty);
  if (n == null) return null;
  const u = String(unit || "").trim().toLowerCase();
  if (u === "kg" || u === "kgs" || u === "kilo") return n;
  if (u === "g" || u === "gm" || u === "gms" || u === "gram" || u === "grams") return n / 1000;
  if (u === "quintal") return n * 100;
  return null;
}

export const perKg = (perQuintal) => perQuintal / 100;

// ---------- dates and freshness ----------

export function parseArrival(dmy) {
  const m = String(dmy || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}

export function ageInDays(date, now = new Date()) {
  if (!date) return null;
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((a - b) / 86400000);
}

export function freshness(date) {
  const age = ageInDays(date);
  if (age == null) return { current: false, label: "Date not reported" };
  if (age <= 0) return { current: true, label: "Today" };
  if (age === 1) return { current: true, label: "Yesterday" };
  return { current: false, label: `${age} days old` };
}

// ---------- fetching ----------

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}
function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked */
  }
}

export function summarise(commodity, records) {
  const exact = records.filter((r) => r.commodity === commodity && Number.isFinite(Number(r.modal_price)));
  if (!exact.length) return null;
  // latest reporting date only
  const dated = exact.map((r) => ({ ...r, _date: parseArrival(r.arrival_date) })).filter((r) => r._date);
  if (!dated.length) return null;
  const latest = Math.max(...dated.map((r) => r._date.getTime()));
  const day = dated.filter((r) => r._date.getTime() === latest).sort((a, b) => Number(a.modal_price) - Number(b.modal_price));
  const median = day[Math.floor((day.length - 1) / 2)];
  const modals = day.map((r) => Number(r.modal_price));
  return {
    commodity,
    arrivalDate: median.arrival_date,
    market: median.market,
    district: median.district,
    state: median.state,
    variety: median.variety,
    grade: median.grade,
    minPrice: Number(median.min_price),
    maxPrice: Number(median.max_price),
    modalPrice: Number(median.modal_price),
    marketsReporting: day.length,
    modalLow: modals[0],
    modalHigh: modals[modals.length - 1],
  };
}

// data.gov.in occasionally answers with an HTML error page (which browsers also report as a
// CORS failure, since it lacks the CORS header). Treat that as a failure, never as "no price",
// and retry twice with a growing pause.
async function getWithRetry(url, retries = 2) {
  try {
    const res = await axios.get(url, { timeout: 25000 });
    if (!res.data || typeof res.data !== "object" || !Array.isArray(res.data.records)) {
      throw new Error("Unexpected response from data.gov.in");
    }
    return res;
  } catch (e) {
    if (retries <= 0) throw e;
    await new Promise((r) => setTimeout(r, retries === 2 ? 1000 : 2500));
    return getWithRetry(url, retries - 1);
  }
}

const PAGE = 1000;
const MAX_PAGES = 3; // fuzzy matches can exceed 1,000 ("Green Chilli" pulls in every "green" commodity)

async function fetchCommodity(commodity) {
  const records = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `https://api.data.gov.in/resource/${RESOURCE}?api-key=${encodeURIComponent(KEY)}&format=json&limit=${PAGE}&offset=${page * PAGE}&filters%5Bcommodity%5D=${encodeURIComponent(commodity)}`;
    const res = await getWithRetry(url);
    records.push(...res.data.records);
    const total = Number(res.data.total) || 0;
    if ((page + 1) * PAGE >= total) break;
  }
  return summarise(commodity, records);
}

// Prices for a set of commodities, cached for 6 hours; a stale cached price is shown
// (marked with its real date) only when the API cannot be reached.
export function useMarketPrices(commodities) {
  const key = useMemo(() => [...new Set(commodities.filter(Boolean))].sort().join("|"), [commodities]);
  const [state, setState] = useState({ prices: {}, loading: false, failed: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!hasMarketKey || !key) {
      setState({ prices: {}, loading: false, failed: [], error: null });
      return;
    }
    let live = true;
    const wanted = key.split("|");
    const cache = readCache();
    const now = Date.now();
    const fresh = {};
    const toFetch = [];
    wanted.forEach((c) => {
      const hit = cache[c];
      if (hit && now - hit.fetchedAt < TTL_MS) fresh[c] = hit;
      else toFetch.push(c);
    });
    setState({ prices: fresh, loading: toFetch.length > 0, failed: [], error: null });
    if (!toFetch.length) return;

    (async () => {
      const results = { ...fresh };
      const failed = [];
      // a few at a time: the API is slow and rate-limited
      for (let i = 0; i < toFetch.length; i += 3) {
        const batch = toFetch.slice(i, i + 3);
        const settled = await Promise.allSettled(batch.map(fetchCommodity));
        settled.forEach((s, j) => {
          const c = batch[j];
          if (s.status === "fulfilled") {
            results[c] = { data: s.value, fetchedAt: Date.now() };
          } else if (cache[c]) {
            results[c] = { ...cache[c], stale: true };
            failed.push(c);
          } else {
            failed.push(c);
          }
        });
        if (live) setState((st) => ({ ...st, prices: { ...results } }));
      }
      const next = { ...readCache() };
      Object.entries(results).forEach(([c, v]) => {
        if (!v.stale) next[c] = { data: v.data, fetchedAt: v.fetchedAt };
      });
      writeCache(next);
      if (live) {
        setState({
          prices: results,
          loading: false,
          failed,
          error: failed.length ? `Couldn't reach data.gov.in for ${failed.length} ${failed.length === 1 ? "item" : "items"}.` : null,
        });
      }
    })();

    return () => {
      live = false;
    };
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

// ---------- formatting ----------

const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Whole rupees stay whole (₹145); anything with paise shows both digits (₹52.50, not ₹52.5)
const inrAuto = (n) => (Number.isInteger(Math.round(n * 100) / 100) ? inr0 : inr2).format(n);
export const formatInr = (n, precise = false) => (precise ? inrAuto(n) : inr0.format(n));
export const formatPerKg = (perQuintal) => `${inrAuto(perKg(perQuintal))}/kg`;
export const formatPerQuintal = (perQuintal) => `${inr0.format(perQuintal)}/quintal`;
export function formatArrival(dmy) {
  const d = parseArrival(dmy);
  return d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d) : dmy || "";
}
