import { Apple, Milk, Wheat, Drumstick, Flame, Package, CupSoda, ShoppingBag } from "lucide-react";
import { uid } from "./storage";

export const CATEGORIES = [
  { id: "produce", label: "Fruit & veg", icon: Apple },
  { id: "dairy", label: "Dairy & eggs", icon: Milk },
  { id: "grains", label: "Grains & bakery", icon: Wheat },
  { id: "protein", label: "Meat, fish & tofu", icon: Drumstick },
  { id: "spices", label: "Spices & sauces", icon: Flame },
  { id: "staples", label: "Pantry staples", icon: Package },
  { id: "drinks", label: "Drinks", icon: CupSoda },
  { id: "other", label: "Other", icon: ShoppingBag },
];

const KEYWORDS = {
  produce: ["apple", "banana", "mango", "lemon", "lime", "orange", "grape", "berry", "tomato", "onion", "potato", "garlic", "ginger", "carrot", "spinach", "palak", "methi", "coriander", "cilantro", "mint", "chilli", "chili", "pepper", "capsicum", "cabbage", "cauliflower", "broccoli", "peas", "beans", "okra", "bhindi", "brinjal", "aubergine", "eggplant", "cucumber", "lettuce", "mushroom", "pumpkin", "gourd", "radish", "beetroot", "avocado", "celery", "leek", "shallot", "spring onion", "scallion", "zucchini", "courgette", "fruit", "vegetable", "parsley", "basil", "thyme", "rosemary", "dill", "kale"],
  dairy: ["milk", "paneer", "curd", "yogurt", "yoghurt", "dahi", "butter", "ghee", "cheese", "cream", "egg", "khoya", "buttermilk", "mozzarella", "parmesan", "cheddar"],
  grains: ["rice", "basmati", "atta", "flour", "maida", "bread", "pav", "roti", "naan", "oats", "poha", "semolina", "suji", "rava", "pasta", "spaghetti", "noodle", "quinoa", "barley", "wheat", "tortilla", "bun", "croissant", "biscuit"],
  protein: ["chicken", "mutton", "lamb", "beef", "pork", "fish", "prawn", "shrimp", "salmon", "tuna", "tofu", "soya", "bacon", "sausage", "ham", "turkey", "duck", "goat", "mince"],
  spices: ["salt", "turmeric", "haldi", "cumin", "jeera", "masala", "garam", "chilli powder", "paprika", "cinnamon", "cardamom", "clove", "mustard", "hing", "asafoetida", "fenugreek", "sauce", "ketchup", "vinegar", "soy", "spice", "oregano", "nutmeg", "bay leaf", "coriander powder", "stock", "bouillon", "pepper powder", "black pepper"],
  staples: ["oil", "sugar", "jaggery", "dal", "lentil", "chickpea", "chana", "rajma", "kidney bean", "honey", "jam", "peanut", "almond", "cashew", "nut", "raisin", "seed", "coconut", "tamarind", "baking", "yeast", "cornflour", "starch", "tomato puree", "paste"],
  drinks: ["tea", "chai", "coffee", "juice", "water", "soda", "cola", "lassi", "drink"],
};

// Order matters: specific matches (e.g. "chilli powder") are checked before broad ones ("chilli")
const ORDER = ["spices", "staples", "protein", "dairy", "grains", "drinks", "produce"];
// Words that would otherwise be caught by a shorter keyword ("egg" in eggplant, "water" in watermelon)
const OVERRIDES = [
  [/eggplant|watermelon|melon|coconut water/, "produce"],
  [/steak/, "protein"],
];

export function categorize(name = "") {
  const n = name.toLowerCase();
  for (const [re, cat] of OVERRIDES) if (re.test(n)) return cat;
  for (const cat of ORDER) {
    if (KEYWORDS[cat].some((k) => n.includes(k))) return cat;
  }
  return "other";
}

export const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const UNITS = ["g", "kg", "ml", "L", "pcs", "pack", "bunch", "dozen", "tsp", "tbsp", "cup"];

// Best-effort parse of TheMealDB measures like "200g", "1/2 tsp", "2 large"
export function parseMeasure(measure = "") {
  const m = measure.trim();
  if (!m) return { qty: "", unit: "" };
  const match = m.match(/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\/\d+|½|¼|¾)\s*([a-zA-Z]+)?/);
  if (!match) return { qty: "", unit: m.length <= 14 ? m : "" };
  const qty = match[1].replace(/\s+/g, " ");
  const rawUnit = (match[2] || "").toLowerCase();
  const map = { g: "g", gm: "g", gms: "g", gram: "g", grams: "g", kg: "kg", ml: "ml", l: "L", ltr: "L", litre: "L", liter: "L", tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp", tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp", tblsp: "tbsp", tbs: "tbsp", cup: "cup", cups: "cup", pack: "pack", packet: "pack", bunch: "bunch", dozen: "dozen" };
  return { qty, unit: map[rawUnit] ?? "pcs" };
}

// kind: "commodity" for loose staples typed in or added from recipes; "product" for packaged,
// branded items added from product search (these never borrow a mandi price)
export function makeItem({ name, qty = "", unit = "", category, source = null, kind = "commodity" }) {
  const clean = name.trim();
  return {
    id: uid(),
    name: clean,
    qty: String(qty).trim(),
    unit: unit.trim(),
    category: category || categorize(clean),
    done: false,
    source,
    kind,
    addedAt: Date.now(),
  };
}

const norm = (s) => s.trim().toLowerCase().replace(/s$/, "");

export const inPantry = (pantry, name) => pantry.some((p) => {
  const a = norm(p);
  const b = norm(name);
  return a === b || b.includes(a) || a.includes(b);
});

// Adds ingredients that are neither in the pantry nor already on the list
export function mergeIngredients(list, pantry, ingredients, source) {
  const onList = new Set(list.filter((i) => !i.done).map((i) => norm(i.name)));
  let skippedPantry = 0;
  let skippedList = 0;
  const added = [];
  for (const ing of ingredients) {
    if (inPantry(pantry, ing.name)) { skippedPantry++; continue; }
    if (onList.has(norm(ing.name))) { skippedList++; continue; }
    const { qty, unit } = parseMeasure(ing.measure);
    added.push(makeItem({ name: ing.name, qty, unit, source }));
    onList.add(norm(ing.name));
  }
  return { next: [...list, ...added], added: added.length, skippedPantry, skippedList };
}
