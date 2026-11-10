/** @type {import('tailwindcss').Config} */

// Brand tokens. 60% butter cream, 30% forest green, 10% hot pink.
// Every colour in the app is one of these three or a tint/shade derived from them.
const cream = {
  50: "#FDFAF4", // raised sheet on the cream ground
  100: "#FAF4E8", // working surface (inputs, list rows)
  200: "#F4EAD5", // BRAND: page ground (60%)
  300: "#EADCBE", // pressed / sunken cream
  400: "#DCC9A2", // strong cream rule
};

const forest = {
  50: "#E9EFEA",
  100: "#D3DFD6",
  200: "#A9C0B1",
  300: "#7A9A88",
  400: "#4F7462", // icon tint on cream (non-text)
  500: "#3A5D4D",
  600: "#2C4C3E", // rail hover / active step
  700: "#1E3B2F", // BRAND: forest green (30%)
  800: "#173027",
  900: "#10211A", // deepest ink, text on hot pink
};

const pink = {
  50: "#FFF0F7",
  100: "#FFE1F0", // badge ground
  300: "#FF8CC8",
  500: "#FF3EA5", // BRAND: hot pink accent (10%)
  700: "#C2006F", // pink used as text on cream (5:1)
};

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        cream: { ...cream, DEFAULT: cream[200] },
        forest: { ...forest, DEFAULT: forest[700] },
        pink: { ...pink, DEFAULT: pink[500] },
        ink: {
          DEFAULT: forest[700], // primary text
          soft: "#4A5F55", // secondary text, 5.7:1 on cream
          muted: "#5C6C62", // muted text, 4.6:1 on cream
        },
        danger: { DEFAULT: "#A3302A", soft: "#F6DCD5" },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Figtree Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Fixed rem scale for product UI (about 1.2 ratio)
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.4rem" }],
        md: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.5rem" }],
        xl: ["1.375rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.75rem", { lineHeight: "2.1rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["2.75rem", { lineHeight: "3rem" }],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        // Neutral, soft, small. Tinted from forest, never coloured glows.
        sheet: "0 1px 2px rgb(16 33 26 / 0.05), 0 2px 8px rgb(16 33 26 / 0.04)",
        lift: "0 2px 4px rgb(16 33 26 / 0.06), 0 8px 24px rgb(16 33 26 / 0.08)",
        dialog: "0 12px 48px rgb(16 33 26 / 0.22)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      transitionDuration: {
        fast: "140ms",
        base: "200ms",
      },
      maxWidth: {
        page: "75rem",
      },
    },
  },
  plugins: [],
};
