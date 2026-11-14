import { fuzzySearchMeals, fuzzyScore } from "../lib/meals";

// Shaped like TheMealDB category listings (name, category, cuisine)
const meals = [
  { idMeal: "1", strMeal: "Lamb Biryani", strCategory: "Lamb", strArea: "India" },
  { idMeal: "2", strMeal: "Matar Paneer", strCategory: "Vegetarian", strArea: "India" },
  { idMeal: "3", strMeal: "Chicken Handi", strCategory: "Chicken", strArea: "India" },
  { idMeal: "4", strMeal: "Chicken Alfredo Primavera", strCategory: "Chicken", strArea: "Italian" },
  { idMeal: "5", strMeal: "Apple Frangipan Tart", strCategory: "Dessert", strArea: "British" },
  { idMeal: "6", strMeal: "Æbleskiver", strCategory: "Dessert", strArea: "Norway" },
];
const names = (q) => fuzzySearchMeals(meals, q).map((m) => m.strMeal);

describe("fuzzy recipe search", () => {
  test("tolerates typos", () => {
    expect(names("biryni")).toEqual(["Lamb Biryani"]);
    expect(names("paner")).toEqual(["Matar Paneer"]);
    expect(names("chiken handi")[0]).toBe("Chicken Handi");
  });

  test("exact and prefix matches rank above typo matches", () => {
    expect(names("chicken")).toEqual(["Chicken Alfredo Primavera", "Chicken Handi"]);
    expect(names("chik")).toEqual(expect.arrayContaining(["Chicken Handi", "Chicken Alfredo Primavera"]));
  });

  test("matches category and cuisine, including near-misses", () => {
    expect(names("dessert")).toEqual(["Æbleskiver", "Apple Frangipan Tart"]);
    expect(names("indian")).toEqual(expect.arrayContaining(["Lamb Biryani", "Matar Paneer", "Chicken Handi"]));
  });

  test("every word must match, and short words need an exact hit", () => {
    expect(names("chicken tart")).toEqual([]);
    expect(names("xyz")).toEqual([]);
    expect(fuzzyScore("", ["Lamb Biryani"])).toBe(0);
  });
});
