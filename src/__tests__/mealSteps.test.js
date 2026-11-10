import { mealSteps } from "../lib/meals";

describe("splitting TheMealDB instructions into steps", () => {
  test("hard-wrapped prose is not split mid-sentence (real Baingan Bharta text)", () => {
    const strInstructions =
      "Rinse the baingan (eggplant or aubergine) in water. Pat dry with a kitchen napkin. Apply some oil all over and\r\nkeep it for roasting on an open flame. You can also grill the baingan or roast in the oven. But then you won't get\r\nthe smoky flavor of the baingan.";
    const steps = mealSteps({ strInstructions });
    expect(steps).toHaveLength(1);
    expect(steps[0]).toContain("all over and keep it for roasting");
  });

  test("one step per line stays one step per line, with numbering removed", () => {
    const steps = mealSteps({ strInstructions: "STEP 1\r\nHeat the oil.\r\nSTEP 2\r\nAdd the onions and fry.\r\n3. Serve hot." });
    expect(steps).toEqual(["Heat the oil.", "Add the onions and fry.", "Serve hot."]);
  });

  test("blank-line paragraphs are separate steps", () => {
    expect(mealSteps({ strInstructions: "Boil water.\r\n\r\nAdd pasta." })).toEqual(["Boil water.", "Add pasta."]);
  });
});
