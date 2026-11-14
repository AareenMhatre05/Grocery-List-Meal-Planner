import axios from "axios";
import { Coffee, Moon, Sun, Cookie } from "lucide-react";
import INDIAN from "../data/indianRecipes";
import PHOTOS from "../data/recipePhotos.json";
import { inPantry } from "./grocery";

const API = "https://www.themealdb.com/api/json/v1/1";

export const SLOTS = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "lunch", label: "Lunch", icon: Sun },
  { id: "dinner", label: "Dinner", icon: Moon },
  { id: "snack", label: "Snack", icon: Cookie },
];

export const slotLabel = (id) => SLOTS.find((s) => s.id === id)?.label ?? String(id ?? "");

// TheMealDB returns { meals: null } for no results, and an object (not an array) from paid endpoints
const list = (data) => (Array.isArray(data?.meals) ? data.meals : []);

export async function searchMeals(query) {
  const res = await axios.get(`${API}/search.php?s=${encodeURIComponent(query)}`);
  return list(res.data);
}

export async function mealsByIngredient(ingredient) {
  const res = await axios.get(`${API}/filter.php?i=${encodeURIComponent(ingredient)}`);
  return list(res.data);
}

export async function mealsByCategory(category) {
  const res = await axios.get(`${API}/filter.php?c=${encodeURIComponent(category)}`);
  return list(res.data);
}

// ---------- local Indian recipes, in TheMealDB's shape so every page handles them the same ----------

const LOCAL_PREFIX = "in-";
const toMeal = (r) => ({
  idMeal: LOCAL_PREFIX + r.id,
  strMeal: r.name,
  strCategory: r.category,
  strArea: "India",
  strMealThumb: `${process.env.PUBLIC_URL || ""}/recipes/${r.id}.jpg`,
  photoCredit: PHOTOS[r.id], // { author, license, licenseUrl, source }
  strInstructions: r.steps.join("\n\n"),
  strYoutube: `https://www.youtube.com/watch?v=${r.video}`,
  ...Object.fromEntries(r.ingredients.flatMap(([measure, name], i) => [[`strIngredient${i + 1}`, name], [`strMeasure${i + 1}`, measure]])),
  veg: r.veg,
  region: r.region,
  time: r.time,
  serves: r.serves,
  videoChannel: r.channel,
  local: true,
});
export const LOCAL_MEALS = INDIAN.map(toMeal);
const localById = new Map(LOCAL_MEALS.map((m) => [m.idMeal, m]));

// Local recipes that use an ingredient, matched the way the pantry matches names
export const localMealsWith = (ingredient) =>
  LOCAL_MEALS.filter((m) => mealIngredients(m).some((i) => inPantry([ingredient], i.name)));

// Local recipes plus the whole TheMealDB catalogue (name, photo, category, cuisine) for fuzzy search:
// one light request per category, fetched once per visit and only when someone searches.
let indexPromise = null;
export function loadMealIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const cats = list((await axios.get(`${API}/list.php?c=list`)).data).map((c) => c.strCategory);
      const perCat = await Promise.all(cats.map((c) => mealsByCategory(c).then((ms) => ms.map((m) => ({ ...m, strCategory: c })))));
      const byId = new Map();
      perCat.flat().forEach((m) => byId.has(m.idMeal) || byId.set(m.idMeal, m));
      return [...LOCAL_MEALS, ...byId.values()];
    })().catch((e) => {
      indexPromise = null; // let a retry fetch again
      throw e;
    });
  }
  return indexPromise;
}

// ---------- fuzzy search ----------

const fnorm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function editDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

// Typos allowed grow with word length: none for 1-3 letters, 1 for 4-6, 2 for 7+
const allowedTypos = (len) => (len <= 3 ? 0 : len <= 6 ? 1 : 2);

function wordScore(q, w) {
  if (w === q) return 1;
  if (w.startsWith(q)) return 0.9;
  if (q.length >= 3 && w.includes(q)) return 0.75;
  const k = allowedTypos(q.length);
  if (!k) return 0;
  // compare with the whole word and with its start, so half-typed words ("chik") still match
  const d = Math.min(editDistance(q, w), editDistance(q, w.slice(0, q.length)));
  return d <= k ? 0.7 - 0.15 * d : 0;
}

// Score a query against fields (the first is the name; others count a little less).
// Every query word must match some word; 0 means no match.
export function fuzzyScore(query, fields) {
  const q = fnorm(query);
  if (!q) return 0;
  const name = fnorm(fields[0]);
  if (name.includes(q)) return name.startsWith(q) ? 2 : 1.9;
  const words = fields.flatMap((f, i) => fnorm(f).split(" ").filter(Boolean).map((w) => ({ w, weight: i === 0 ? 1 : 0.8 })));
  const tokens = q.split(" ");
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const { w, weight } of words) best = Math.max(best, wordScore(t, w) * weight);
    if (!best) return 0;
    total += best;
  }
  return total / tokens.length;
}

export function fuzzySearchMeals(meals, query) {
  return meals
    .map((m) => ({ m, s: fuzzyScore(query, [m.strMeal, m.strCategory, m.strArea]) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.m.strMeal.localeCompare(b.m.strMeal))
    .map((x) => x.m);
}

export async function lookupMeal(id) {
  if (String(id).startsWith(LOCAL_PREFIX)) return localById.get(String(id)) ?? null;
  const res = await axios.get(`${API}/lookup.php?i=${encodeURIComponent(id)}`);
  return list(res.data)[0] ?? null;
}

export function mealIngredients(meal) {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal?.[`strIngredient${i}`]?.trim();
    const measure = meal?.[`strMeasure${i}`]?.trim() ?? "";
    if (name) items.push({ name, measure });
  }
  return items;
}

// TheMealDB instructions are either one step per line, or prose hard-wrapped mid-sentence
// ("Apply some oil all over and\r\nkeep it for roasting..."). A line that does not end a
// sentence continues on the next line, so wrapped prose is not split into fragments.
export function mealSteps(meal) {
  const lines = (meal?.strInstructions ?? "")
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const steps = [];
  let current = "";
  for (const line of lines) {
    current = current ? `${current} ${line}` : line;
    if (/[.!?:)\]]["'”’]?$/.test(line)) {
      steps.push(current);
      current = "";
    }
  }
  if (current) steps.push(current);
  return steps
    .map((s) => s.replace(/^\s*(step\s*\d+[:.)]?|\d+[.)])\s*/i, "").trim())
    .filter((s) => s.length > 2);
}

export const toPlanEntry = (meal) => ({
  id: meal.idMeal,
  name: meal.strMeal,
  thumb: meal.strMealThumb,
});

// TheMealDB serves sized copies at <url>/preview|medium; the app's own photos are already small
export const sizedThumb = (url, size) => (url && url.includes("themealdb.com") ? `${url}/${size}` : url || null);

export function youtubeEmbed(url) {
  const match = url?.match(/[?&]v=([^&]+)/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

// Name-based veg / non-veg filter, kept from the original suggestions page
const NON_VEG = ["chicken", "mutton", "beef", "pork", "fish", "egg", "bacon", "lamb", "meat", "steak", "shrimp", "turkey", "prawn", "salmon", "tuna", "duck", "goat"];
export const isNonVeg = (name = "") => NON_VEG.some((w) => name.toLowerCase().includes(w));
// Local recipes carry an explicit veg flag ("Keema Matar" has no meat word in its name)
export const mealIsNonVeg = (meal) => (typeof meal?.veg === "boolean" ? !meal.veg : isNonVeg(meal?.strMeal));
