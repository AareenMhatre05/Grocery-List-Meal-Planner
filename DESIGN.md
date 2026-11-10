---
name: Grocery & Meal Planner
description: A pantry-first kitchen ledger in butter cream, forest green and a single hot-pink stroke.
colors:
  cream-50: "#FDFAF4"
  cream-100: "#FAF4E8"
  cream-200: "#F4EAD5"
  cream-300: "#EADCBE"
  cream-400: "#DCC9A2"
  forest-300: "#7A9A88"
  forest-400: "#4F7462"
  forest-600: "#2C4C3E"
  forest-700: "#1E3B2F"
  forest-900: "#10211A"
  pink-100: "#FFE1F0"
  pink-300: "#FF8CC8"
  pink-500: "#FF3EA5"
  pink-700: "#C2006F"
  ink-soft: "#4A5F55"
  ink-muted: "#5C6C62"
  danger: "#A3302A"
  danger-soft: "#F6DCD5"
typography:
  display:
    fontFamily: "\"Bricolage Grotesque Variable\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
    fontVariation: "\"opsz\" 48"
  headline:
    fontFamily: "\"Bricolage Grotesque Variable\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "2.5rem"
    letterSpacing: "-0.02em"
    fontVariation: "\"opsz\" 48"
  title:
    fontFamily: "\"Bricolage Grotesque Variable\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 48"
  numeral:
    fontFamily: "\"Bricolage Grotesque Variable\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
  body:
    fontFamily: "\"Figtree Variable\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.4rem"
  label:
    fontFamily: "\"Figtree Variable\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  caption:
    fontFamily: "\"Figtree Variable\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
rounded:
  sm: "6px"
  DEFAULT: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  page-x-mobile: "16px"
  page-x-tablet: "24px"
  page-x-desktop: "40px"
  page-max: "75rem"
  rail: "248px"
  control: "40px"
  control-sm: "32px"
  sheet-pad: "20px"
  section-gap: "32px"
  stack: "12px"
components:
  button-primary:
    backgroundColor: "{colors.forest-700}"
    textColor: "{colors.cream-200}"
    typography: "{typography.body}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.forest-600}"
  button-secondary:
    backgroundColor: "{colors.cream-50}"
    textColor: "{colors.forest-700}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.cream-100}"
  button-ghost:
    textColor: "{colors.forest-700}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    textColor: "{colors.danger}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  button-danger-hover:
    backgroundColor: "{colors.danger-soft}"
  button-sm:
    typography: "{typography.label}"
    padding: "0 12px"
    height: "32px"
  input:
    backgroundColor: "{colors.cream-50}"
    textColor: "{colors.forest-700}"
    typography: "{typography.body}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 12px"
    height: "40px"
  sheet:
    backgroundColor: "{colors.cream-50}"
    rounded: "{rounded.xl}"
    padding: "20px"
  tag-neutral:
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  tag-pink:
    backgroundColor: "{colors.pink-100}"
    textColor: "{colors.pink-700}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  tag-forest:
    backgroundColor: "{colors.forest-700}"
    textColor: "{colors.cream-200}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  nav-rail:
    backgroundColor: "{colors.forest-700}"
    textColor: "{colors.cream-200}"
    width: "248px"
  nav-rail-item-active:
    backgroundColor: "{colors.forest-600}"
    textColor: "{colors.cream-200}"
    rounded: "{rounded.DEFAULT}"
    height: "40px"
  nav-count-badge:
    backgroundColor: "{colors.pink-500}"
    textColor: "{colors.forest-900}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
  segmented:
    backgroundColor: "{colors.cream-50}"
    rounded: "{rounded.md}"
    padding: "4px"
    height: "40px"
  segmented-active:
    backgroundColor: "{colors.forest-700}"
    textColor: "{colors.cream-200}"
    rounded: "{rounded.DEFAULT}"
    height: "32px"
  checkbox-checked:
    backgroundColor: "{colors.pink-500}"
    textColor: "{colors.forest-900}"
    rounded: "{rounded.sm}"
    size: "22px"
  toast:
    backgroundColor: "{colors.forest-700}"
    textColor: "{colors.cream-200}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: Grocery & Meal Planner

## Overview

**Creative North Star: "The Kitchen Ledger"**

The app is set like a printed kitchen ledger on butter-cream paper: ruled rows tinted from forest green, a solid forest rail holding the navigation, green ink for every heading and primary action, and one hot-pink pen used only when something is done, due today, or needs counting. Every screen is a step of the same loop (pantry, recipes, week, list), so the system favours ruled lists, tables and sheets over tiles and widgets.

Density is calm and product-grade: a fixed rem type scale, 40px controls, 16px sheets with hairline borders, and soft forest-tinted shadows that barely lift. The only imagery is real food photography from TheMealDB, set flush into cells and cards without frames. Motion is short and ease-out; the one expressive gesture is the hand-drawn pink strike across a checked grocery item.

Confirmed rejections, from the binding brand brief: no grey admin shell with stat tiles and icon grids, no gradients, no glassmorphism, no heavy shadows or coloured glows, no oversized buttons, no colours outside the cream, forest and pink ramps.

**Key Characteristics:**
- 60% butter cream ground, 30% forest green structure, 10% hot pink accent.
- Bricolage Grotesque headings and numerals; Figtree for everything you read and tap.
- Hairline forest-tinted rules organise content; sheets, not cards, hold it.
- Real food photos only; no illustration, no stock, no invented data.
- Pink means "done", "today" or "count", never decoration.

## Colors

A warm three-ink palette: butter-cream paper, forest-green ink, and a single hot-pink pen.

### Primary
- **Forest Green** (forest-700): the 30% voice. Desktop rail, mobile top and tab bars, primary buttons, active segmented options, selected day tabs, focus rings, all heading and body ink, the "Still to buy" panel and toasts.
- **Rail Moss** (forest-600): hover and active fill for navigation items on the forest rail, primary-button hover, icon chips on forest.
- **Night Forest** (forest-900): deepest ink; the only text colour allowed on hot pink fills, and the selection text colour.
- **Sage Ink** (forest-400) and **Pale Sage** (forest-300): non-text icon tints on cream (slot and category icons, photo fallbacks). Never body text.

### Tertiary
- **Hot Pink** (pink-500): the 10% accent, used full-strength only as a fill or stroke: the checked checkbox, the grocery strike, the "today" dot, toast and success ticks, and one count badge per screen.
- **Deep Pink** (pink-700): pink as text on cream, at 5:1. "Today" day labels in the planner and week strip, pink tag text, the caret colour.
- **Blush** (pink-100): pink tag ground and text selection highlight.
- **Soft Pink** (pink-300): hover fill for pink buttons only.

### Neutral
- **Butter Cream** (cream-200): the page ground everywhere, and cream text on forest.
- **Raised Cream** (cream-50): sheets, list containers, inputs, secondary buttons, dialogs; today's column in the ledger.
- **Working Cream** (cream-100): secondary-button hover, the "In the basket" list ground.
- **Pressed Cream** (cream-300): skeletons and empty photo wells.
- **Rule Cream** (cream-400): scrollbar thumb, strongest cream rule.
- **Soft Ink** (ink-soft): secondary text, descriptions, inactive tab labels (5.7:1 on cream).
- **Muted Ink** (ink-muted): placeholders, captions, counts beside headings (4.6:1 on cream).
- **Paprika** (danger) on **Paprika Wash** (danger-soft): destructive buttons, remove icons on hover, error notes. The only colour outside the three brand ramps, reserved for errors and destruction.

Borders and dividers are forest-700 at low alpha: 8% for row rules, 10% for sheet and ledger borders, 15 to 20% for control strokes, rising to 30 to 40% on hover. On forest, rules are cream at 10%.

### Named Rules
**The 60/30/10 Rule.** Cream is the ground, forest is the structure, pink is the accent. Any new colour must be a tint, shade or alpha of these three; Paprika is the single sanctioned exception, for errors only.

**The Deep Pink Text Rule.** Hot pink is 2.7:1 on cream, so it is never text on cream. Where pink must be read on a light ground, use Deep Pink. Full-strength Hot Pink appears as a fill, a tick, a stroke, or large numerals on forest.

**The One Pink Count Rule.** Each screen carries at most one pink count. On the dashboard the "Still to buy" number owns it, so the rail's grocery badge turns cream; on every other screen the rail badge is the pink count.

## Typography

**Display Font:** Bricolage Grotesque Variable (with ui-sans-serif, system-ui)
**Body Font:** Figtree Variable (with ui-sans-serif, system-ui)

**Character:** Bricolage, fixed at its 48 optical size and set tight, gives headings a warm, slightly inky editorial voice; Figtree is open, round and quietly legible for every list row, label and control.

### Hierarchy
- **Display** (600, 2.75rem, 1.05): the one big title of a destination screen: the date on Today, the recipe name on its detail page, the login brand line.
- **Headline** (600, 2.25rem, 2.5rem): standard page titles via the page header (Week planner, Grocery list, Pantry, Recipes, Profile).
- **Title** (600, 1.375rem, 1.75rem): section titles within a page, and the active day heading in the mobile planner.
- **Numeral** (Bricolage 600, 1.125 to 1.375rem, line-height 1, tabular): day-of-month numbers in the ledger and week strip, recipe step numbers. The large pink count on the forest panel uses this voice at 2.25rem.
- **Body** (Figtree 400, 0.9375rem, 1.4rem): all running text; descriptions cap at 60ch.
- **Label** (Figtree 500, 0.875rem, 1.25rem): field labels, small buttons, category group headings in the grocery list (semibold, Soft Ink, sentence case).
- **Caption** (Figtree 400 to 500, 0.75rem, 1rem): day abbreviations, meal-source notes, tags, badges.

The scale is fixed rem at roughly 1.2 between steps; it does not use fluid clamp sizing. Headings balance their wrap.

### Named Rules
**The Two Voices Rule.** Bricolage speaks for headings and numerals only; Figtree carries everything else, including group headings inside lists (which are set in Figtree at label size, not as display type).

**The No Eyebrow Rule.** Nothing sits above a heading: no kicker, no uppercase tracked label. Context goes in the description line below the title, in sentence case.

## Layout

The app is a two-column shell from 1024px up: a 248px sticky forest rail on the left and a content column capped at 75rem, padded 40px. Below 1024px the rail becomes a 56px forest top bar (logo and profile) plus a fixed 64px forest tab bar with five destinations; content pads 16px on mobile and 24px from 640px, with extra bottom padding to clear the tab bar.

Page rhythm: the page header sits 32px above the first section; sections are separated by 32 to 40px; section titles sit 12px above their content; sheets pad 16 to 20px. Controls are 40px tall (32px small). Reading widths are capped (descriptions 60ch, the grocery list 48rem).

The weekly planner is the canonical ledger: on desktop a ruled table with a 6.5rem meal-label column and seven equal day columns, meals as rows, photos flush to the cell edges, today's column raised to Raised Cream. Under 1024px it collapses to a seven-day tab strip and one day's slots as a list. The dashboard pairs a wide main column with a 20rem forest side panel.

## Elevation & Depth

Depth comes from tonal layering first: Butter Cream ground, Raised Cream sheets, a hairline forest-alpha border. Shadows are tinted from Night Forest, small and soft, and only three exist. There are no coloured glows and no hover lifts on cards.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 1px 2px rgb(16 33 26 / 0.05), 0 2px 8px rgb(16 33 26 / 0.04)`): resting sheets and the floating edit button over planner photos.
- **Lift** (`box-shadow: 0 2px 4px rgb(16 33 26 / 0.06), 0 8px 24px rgb(16 33 26 / 0.08)`): toasts.
- **Dialog** (`box-shadow: 0 12px 48px rgb(16 33 26 / 0.22)`): native modal dialogs, over a Night Forest backdrop at 45%.

### Named Rules
**The Whisper Shadow Rule.** If a shadow is noticeable before the border is, it is too strong. Borders separate; shadows only hint.

## Shapes

Gently rounded and consistent: controls, buttons, inputs and nav items at 8px; tags, badges and the checkbox at 6px; segmented controls at 10px; row cards, toasts, icon chips and error notes at 12px; sheets, list containers, the ledger, dialogs and recipe photos at 16px. Full pills are reserved for progress bars, plan dots, the mobile active-tab indicator and round tick badges. Photos inside a ruled ledger cell are square-edged and flush; standalone photos take their container's radius via clipping. Empty states and empty planner slots use a dashed forest-alpha border.

## Components

### Buttons
Quiet, compact, confident; never oversized.
- **Shape:** gently rounded (8px), 40px tall with 16px side padding; small size 32px with 12px padding.
- **Primary:** Forest Green fill, Butter Cream text, medium weight; hover to Rail Moss.
- **Secondary:** Raised Cream fill, forest ink, 15% forest border; hover deepens the border to 30% and the fill to Working Cream.
- **Ghost:** no fill; hover lays a 6% forest wash. **Danger:** Paprika text, Paprika Wash on hover.
- **Press:** every pressable scales to 0.97 over 120ms ease-out (disabled under reduced motion). Disabled is 50% opacity.
- **Icons:** Lucide outline icons at 16px, 1.75 stroke, leading the label.

### Chips (Tags)
- **Style:** 24px tall, 6px radius, caption weight 500. Neutral is a 7% forest wash with Soft Ink text; pink is Blush with Deep Pink text; forest is solid with cream text.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Raised Cream on the cream ground; Working Cream for completed groups.
- **Shadow Strategy:** Sheet shadow at most (see Elevation & Depth); list containers rely on the border alone.
- **Border:** 1px forest at 10%; internal row rules at 8%.
- **Internal Padding:** 16 to 20px; list containers pad horizontally only and let rows set height (52px minimum).

### Inputs / Fields
- **Style:** 40px, 8px radius, Raised Cream fill, 1px forest stroke at 20% (35% on hover); selects carry an inline forest chevron.
- **Focus:** border goes full Forest Green with a 2px forest outline; the global focus ring is 2px Forest Green offset 2px, switching to Butter Cream on forest surfaces. The text caret is Deep Pink.
- **Labels:** label weight above the control, hint in Muted Ink below. **Disabled:** 60% opacity. **Errors:** Paprika text on Paprika Wash, 12px radius, with a retry action.

### Navigation
- **Desktop rail:** solid Forest Green, logo at top, items 40px with an 18px icon, 0.9375rem labels in cream at 75%; hover to Rail Moss at 60%, active solid Rail Moss with full cream text. Profile and log out sit below a cream 10% rule at the foot.
- **Mobile:** forest top bar with logo and profile button; forest bottom tab bar, icon over caption label, the active tab marked by a Rail Moss pill behind the icon.
- **Count badge:** tabular caption numerals, 6px radius on the rail and round on the tab bar; Hot Pink with Night Forest text, or cream where the One Pink Count Rule hands the count elsewhere.

### Segmented Control
A 40px Raised Cream track (10px radius, 4px inset, forest 15% border); the active option is a solid Forest Green 32px pill with cream text, inactive options Soft Ink with a 6% forest hover wash.

### Dialogs and Toasts
Modals are native dialogs: Raised Cream, 16px radius, Dialog shadow, entering and leaving with a 200ms fade and 8px rise from 98% scale. Toasts are Forest Green, 12px radius, Lift shadow, with a round Hot Pink tick, rising 8px over 200ms above the tab bar.

### Grocery Check-off (Signature)
The defining interaction. A 22px checkbox (6px radius, 1.5px forest 40% stroke) fills Hot Pink with a Night Forest tick. A hand-drawn Hot Pink stroke (2.2px, round caps) then draws across the item name left to right by clip-path over 240ms ease-out, the name fades to Muted Ink, and after a 420ms hold the row glides (300ms layout move) into the "In the basket" group on Working Cream. Row actions sit in a fixed-width slot so quantities stay aligned through every state. Under reduced motion the stroke appears at once and the row does not travel.

### Food Photos
Real TheMealDB photos at 4:3 (or square thumbnails), object-cover, on a Pressed Cream well; when no photo exists the well shows a Pale Sage outline icon. Never a placeholder illustration.

## Do's and Don'ts

### Do:
- **Do** keep the 60/30/10 balance: Butter Cream ground, Forest Green structure, Hot Pink under a tenth of any screen.
- **Do** use Deep Pink (#C2006F) whenever pink must be read as text on cream.
- **Do** let Hot Pink mean only done, today or count: the tick, the strike, the today dot, one count per screen.
- **Do** separate content with hairline forest-alpha rules (8 to 10%) before reaching for a shadow.
- **Do** set headings and numerals in Bricolage at opsz 48 with tight tracking, and everything else in Figtree.
- **Do** use real food photography only, flush in ledger cells and clipped to the container radius elsewhere.
- **Do** keep controls at 40px (32px small) with 8px corners and ease-out motion of 140 to 240ms, with reduced-motion fallbacks.

### Don't:
- **Don't** set Hot Pink (#FF3EA5) as small text on cream; it is 2.7:1.
- **Don't** show more than one pink count on a screen.
- **Don't** place an eyebrow, kicker or uppercase tracked label above a heading.
- **Don't** show prices, nutrition, calorie counts or cooking times; the data sources do not provide them.
- **Don't** introduce gradients, glassmorphism, coloured glows or heavy shadows.
- **Don't** build screens from stat tiles and icon grids; use ledgers, lists and sheets.
- **Don't** add colours outside the cream, forest and pink ramps except Paprika for errors.
