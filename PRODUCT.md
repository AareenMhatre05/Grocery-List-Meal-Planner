# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who cooks at home and shops for groceries: people cooking for themselves, households planning for several people, beginners and confident cooks alike. The app must work for all of them, so nothing should assume a particular household size, budget, skill level or diet beyond what the user sets in their profile.

Typical situations: deciding what to cook with what is already in the kitchen, planning the coming week's meals, and walking through a shop with the list open on a phone.

## Product Purpose

Grocery & Meal Planner helps people decide what to cook and what to buy. Success means fewer "what's for dinner" decisions made from scratch, fewer wasted ingredients, and a shopping list that is complete before the trip.

## Positioning

Pantry-first. The loop starts from what the user already has: pantry items drive meal suggestions, chosen meals go into a weekly plan, and the grocery list collects what is still needed. A generic recipe site starts from recipes and a generic list app starts from an empty list; this product starts from the user's kitchen.

## Operating Context

- Used on desktop while planning and on a phone while cooking or shopping (the grocery list is the most phone-heavy screen).
- Indian context: English UI, metric units (g, kg, ml, L, pcs), Indian grocery names welcome alongside international recipes.
- Recipes come from TheMealDB (international cuisines, real photos, ingredients, instructions, YouTube links).
- Packaged-product search comes from OpenFoodFacts.

## Capabilities and Constraints

Existing, must be preserved:
- Email/password sign-up and login via Firebase Auth; every page except login is protected.
- Profile stored in Firestore (`profiles/{uid}`): name, meal preference (all / veg / non-veg), allergies, common food type.
- Pantry: add and remove items (browser localStorage).
- Meal suggestions from TheMealDB: by first pantry ingredient, or by diet preference when the pantry is empty; veg / non-veg filter.
- Meal detail: photo, category, cuisine, ingredients with measures, instructions, embedded YouTube video.
- Grocery product search via OpenFoodFacts.

Added in the 2026-11 redesign (confirmed with the user), stored in browser localStorage per device:
- Weekly meal planner: assign TheMealDB meals to breakfast, lunch, dinner and snack slots per day, move between weeks.
- Grocery checklist: items with quantity, unit and category; check off, edit, remove; "Add to grocery list" on a meal adds its ingredients.

Not available, must not be shown as if it were: prices, nutrition values, calorie counts, cooking times (TheMealDB does not provide them), reminders or notifications, cross-device sync of pantry/plan/list.

Stack: React 19 (Create React App), React Router 7, Tailwind CSS 3, Firebase 12, axios.

## Brand Commitments

Binding colour system set by the user, 60/30/10:
- 60% Butter Cream `#F4EAD5`: dominant background and large surfaces.
- 30% Forest Green `#1E3B2F`: navigation, important containers, headings, buttons, icons, selected states.
- 10% Hot Pink `#FF3EA5`: accent only; highlights, key interactive moments, badges, small details.
Tints and shades of these three may be used for borders, hovers and depth; no other dominant colours.

The user asked for: warm, organic, food-inspired, premium lifestyle quality with minimalist editorial restraint; a distinctive heading face with a highly readable body face; no generic AI dashboard or admin-template look; no excessive gradients, glassmorphism, shadows, rounded cards or oversized buttons.

## Evidence on Hand

- Real recipe photos and data from TheMealDB; product photos from OpenFoodFacts.
- No testimonials, user counts, pricing, nutrition data or partner claims exist. Do not fabricate them.

## Product Principles

1. Start from the kitchen: the pantry is the first input, not an afterthought.
2. Show only true data: if a source does not provide it, the UI does not display it.
3. One loop, one place: pantry, suggestions, plan and list should feel like steps of the same task.
4. Built for the shop floor: the list must be fast and legible one-handed on a phone.

## Accessibility & Inclusion

Target WCAG 2.2 AA: text contrast on cream and green, visible focus states, keyboard-operable controls, reduced-motion support. Hot pink is never the only carrier of meaning and is not used for small body text on cream.
