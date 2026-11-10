import axios from "axios";
import { Coffee, Moon, Sun, Cookie } from "lucide-react";

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

export async function lookupMeal(id) {
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

export function youtubeEmbed(url) {
  const match = url?.match(/[?&]v=([^&]+)/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

// Name-based veg / non-veg filter, kept from the original suggestions page
const NON_VEG = ["chicken", "mutton", "beef", "pork", "fish", "egg", "bacon", "lamb", "meat", "steak", "shrimp", "turkey", "prawn", "salmon", "tuna", "duck", "goat"];
export const isNonVeg = (name = "") => NON_VEG.some((w) => name.toLowerCase().includes(w));
