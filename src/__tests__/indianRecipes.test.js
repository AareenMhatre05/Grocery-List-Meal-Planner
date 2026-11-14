import RECIPES from "../data/indianRecipes";
import { LOCAL_MEALS, localMealsWith, lookupMeal, mealIngredients, mealSteps, mealIsNonVeg, fuzzySearchMeals, youtubeEmbed, sizedThumb } from "../lib/meals";
import { parseMeasure } from "../lib/grocery";

describe("Indian recipe collection", () => {
  test("every recipe is complete and fits TheMealDB's shape", () => {
    expect(RECIPES).toHaveLength(60);
    expect(new Set(RECIPES.map((r) => r.id)).size).toBe(60);
    for (const r of RECIPES) {
      expect(r.video).toMatch(/^[\w-]{11}$/);
      expect(r.channel).toBeTruthy();
      expect(typeof r.veg).toBe("boolean");
      expect(r.ingredients.length).toBeGreaterThan(2);
      expect(r.ingredients.length).toBeLessThanOrEqual(20); // TheMealDB shape has 20 ingredient slots
      expect(r.steps.length).toBeGreaterThan(2);
    }
  });

  test("adapted recipes read back like TheMealDB meals", async () => {
    const dosa = await lookupMeal("in-masala-dosa");
    expect(dosa.strMeal).toBe("Masala Dosa");
    expect(mealIngredients(dosa)[0]).toEqual({ name: "Rice", measure: "300 g" });
    expect(mealSteps(dosa)).toHaveLength(RECIPES.find((r) => r.id === "masala-dosa").steps.length);
    expect(youtubeEmbed(dosa.strYoutube)).toBe("https://www.youtube-nocookie.com/embed/J75VQSxOtdo");
    expect(parseMeasure("300 g")).toEqual({ qty: "300", unit: "g" });
    expect(await lookupMeal("in-nope")).toBeNull();
  });

  test("photos: bundled and credited for local recipes, sized copies for TheMealDB", async () => {
    const fs = require("fs");
    const path = require("path");
    for (const m of LOCAL_MEALS) {
      expect(fs.existsSync(path.join(__dirname, "../../public", m.strMealThumb))).toBe(true);
      expect(m.photoCredit.author).toBeTruthy();
      expect(m.photoCredit.license).toMatch(/^(CC0|Public domain|CC BY(-SA)? [\d.]+)$/);
      expect(m.photoCredit.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
    const dosa = await lookupMeal("in-masala-dosa");
    expect(dosa.strMealThumb).toBe("/recipes/masala-dosa.jpg");
    expect(sizedThumb(dosa.strMealThumb, "preview")).toBe("/recipes/masala-dosa.jpg");
    expect(sizedThumb("https://www.themealdb.com/images/media/meals/x.jpg", "preview")).toBe("https://www.themealdb.com/images/media/meals/x.jpg/preview");
    expect(sizedThumb(null, "preview")).toBeNull();
  });

  test("veg flag beats the name check", () => {
    const keema = LOCAL_MEALS.find((m) => m.strMeal === "Keema Matar");
    const sambar = LOCAL_MEALS.find((m) => m.strMeal === "Sambar");
    expect(mealIsNonVeg(keema)).toBe(true);
    expect(mealIsNonVeg(sambar)).toBe(false);
    expect(mealIsNonVeg({ strMeal: "Chicken Handi" })).toBe(true);
  });

  test("pantry matching and fuzzy search find them", () => {
    const paneer = localMealsWith("paneer").map((m) => m.strMeal);
    expect(paneer).toEqual(expect.arrayContaining(["Palak Paneer", "Kadai Paneer", "Paneer Butter Masala"]));
    expect(fuzzySearchMeals(LOCAL_MEALS, "dosa")[0].strMeal).toBe("Masala Dosa");
    expect(fuzzySearchMeals(LOCAL_MEALS, "idly").map((m) => m.strMeal)).toContain("Idli");
    expect(fuzzySearchMeals(LOCAL_MEALS, "poha").map((m) => m.strMeal)).toContain("Kanda Poha");
  });
});
