---
version: 1
slug: "src-app-js"
primary_target: "src/App.js"
related_targets: ["src/components"]
---

# Surface: authenticated app (dashboard, planner, recipes, grocery list, pantry, profile, login)

Mode: Operate. Build path: code-led (Operate surface; no image generation on this machine).

Audience and job: anyone cooking at home in India. Decide what to cook from the pantry, plan the week, and shop from a list on a phone. Constraints: keep Firebase auth, Firestore profile, TheMealDB and OpenFoodFacts integrations, existing routes; show no invented data (no prices, nutrition, cooking times).

Direction pinned by the user's brief (palette 60/30/10, warm organic editorial, premium lifestyle), so concept-seed was not rolled; the brief beats the roll.

## Direction contract

THESIS: The kitchen comes first. Every screen is a step of one loop (pantry, recipes, week, list), not a dashboard of widgets. Refuses the category default of a grey admin shell with stat tiles and an icon grid.

OWN-WORLD: Butter cream ground (#F4EAD5) with lighter cream sheets for working surfaces; a solid forest-green (#1E3B2F) rail and green ink for headings, primary buttons, selection; hot pink (#FF3EA5) only as the tick, the strike, the "today" marker and one count per screen, with deep pink #C2006F where pink must be text. Bricolage Grotesque for headings, Figtree for UI and body. Hairline borders tinted from green, 8px controls, 16px sheets, real food photos from TheMealDB as the only imagery.

STORY: The visitor sees today's plan and what the list still needs, understands the next step, and acts in one tap: plan a slot, cook a recipe, tick an item.

FIRST VIEWPORT: Green rail left (bottom tab bar on mobile). Dashboard opens on the date as title, then a wide "Today" strip of four meal slots with photos, beside a narrow "Still to buy" list with its count in pink; below, the week strip and pantry-to-recipe shortcuts. Primary action: plan a meal.

FORM: Kitchen ledger: a weekly planner set like a printed meal ledger (days as columns, meals as ruled rows) and a grocery list that is struck through by hand. Signature move: checking an item draws a pink ink stroke across it and files it under "In the basket". Position 1 of my list. seed: none (direction pinned by the brief; concept-seed not run).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
