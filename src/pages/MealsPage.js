import React from "react";
import MealSuggestions from "../components/MealSuggestions";

export default function MealsPage() {
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">🍽️ Meal Suggestions</h1>
      <MealSuggestions />
    </div>
  );
}
