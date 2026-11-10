// src/components/IngredientFinder.js
import axios from "axios";

const APP_ID = "YOUR_APP_ID";
const APP_KEY = "YOUR_APP_KEY";

export async function fetchIngredients(query) {
  try {
    const res = await axios.get(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(
        query
      )}`
    );
    return res.data.hints || [];
  } catch (error) {
    console.error("❌ Error fetching ingredients:", error);
    return [];
  }
}

// You can also define some default ingredients to load automatically
export const defaultIngredients = [
  "rice",
  "milk",
  "paneer",
  "egg",
  "tomato",
  "onion",
  "potato",
];
