import React from "react";
import IngredientFinder from "../components/IngredientFinder";

export default function IngredientsPage() {
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">🔍 Ingredient Finder</h1>
      <IngredientFinder />
    </div>
  );
}
