// Small spot illustrations, used only inside the components they belong to
// (empty states and the recipe divider). Flat shapes in the brand palette, matching the logo.
// Decorative: aria-hidden; the surrounding copy carries the meaning.

const C = {
  forest: "#1E3B2F",
  leaf: "#4F7462",
  leafLight: "#7A9A88",
  pink: "#FF3EA5",
  cream: "#F4EAD5",
  sheet: "#FDFAF4",
  bread: "#C9A15E",
  rule: "rgba(30,59,47,0.18)",
};

function Spot({ viewBox, className, children }) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

// Empty grocery list: an open basket with a few things in it
export function BasketSpot({ className = "h-20 w-auto" }) {
  return (
    <Spot viewBox="0 0 140 112" className={className}>
      <ellipse cx="70" cy="104" rx="50" ry="5" fill={C.rule} />
      <path d="M46 52V40C46 26 57 16 70 16S94 26 94 40V52" fill="none" stroke={C.forest} strokeWidth="7" strokeLinecap="round" />
      <path d="M50 58C40 48 32 36 36 26 38 20 45 20 48 24 50 17 58 16 61 22 66 20 70 26 68 32 72 40 68 50 62 58Z" fill={C.leaf} />
      <path d="M58 58C54 48 52 38 54 30" fill="none" stroke={C.leafLight} strokeWidth="3" strokeLinecap="round" />
      <circle cx="80" cy="48" r="14" fill={C.pink} />
      <path d="M80 35c-2-4-6-5-10-4 3 3 6 4 10 4Zm0 0c2-4 6-5 10-4-3 3-6 4-10 4Z" fill={C.leaf} />
      <rect x="92" y="22" width="15" height="42" rx="7.5" fill={C.bread} transform="rotate(28 99 43)" />
      <path d="M22 56H118C120 56 121.5 57.6 121.2 59.5L114 96C113 101 108.5 104 103.5 104H36.5C31.5 104 27 101 26 96L18.8 59.5C18.5 57.6 20 56 22 56Z" fill={C.forest} />
      <path d="M32 72H108M35 86H105" stroke={C.cream} strokeOpacity="0.16" strokeWidth="3" strokeLinecap="round" />
    </Spot>
  );
}

// Empty week: a plate with a basil sprig and a radish
export function PlateSpot({ className = "h-20 w-auto" }) {
  return (
    <Spot viewBox="0 0 140 112" className={className}>
      <ellipse cx="70" cy="100" rx="52" ry="6" fill={C.rule} />
      <ellipse cx="70" cy="66" rx="56" ry="34" fill={C.sheet} stroke={C.forest} strokeOpacity="0.22" strokeWidth="2" />
      <ellipse cx="70" cy="66" rx="40" ry="23" fill="none" stroke={C.forest} strokeOpacity="0.12" strokeWidth="2" />
      <path d="M50 74C58 62 70 54 86 50" fill="none" stroke={C.leaf} strokeWidth="3" strokeLinecap="round" />
      <path d="M58 66C50 60 48 52 52 46 58 48 61 56 58 66Z" fill={C.leaf} />
      <path d="M66 60C64 50 68 42 75 40 77 47 74 55 66 60Z" fill={C.leafLight} />
      <path d="M74 56C80 48 88 46 94 48 91 55 84 58 74 56Z" fill={C.leaf} />
      <circle cx="88" cy="74" r="9" fill={C.pink} />
      <path d="M88 65c0-5 2-9 5-11" fill="none" stroke={C.leaf} strokeWidth="2.5" strokeLinecap="round" />
    </Spot>
  );
}

// Empty pantry: two jars and a small sack
export function PantrySpot({ className = "h-20 w-auto" }) {
  return (
    <Spot viewBox="0 0 140 112" className={className}>
      <ellipse cx="70" cy="104" rx="56" ry="5" fill={C.rule} />
      {/* tall jar with lentils */}
      <rect x="22" y="22" width="36" height="10" rx="3" fill={C.forest} />
      <path d="M24 34H56V94C56 99 52 102 47 102H33C28 102 24 99 24 94Z" fill={C.sheet} stroke={C.forest} strokeOpacity="0.25" strokeWidth="2" />
      <path d="M26 62H54V94C54 98 51 100 47 100H33C29 100 26 98 26 94Z" fill={C.pink} opacity="0.85" />
      <path d="M30 70h4M40 76h4M33 84h4M45 88h4M42 66h4" stroke={C.cream} strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
      {/* short jar with grains */}
      <rect x="64" y="46" width="32" height="9" rx="3" fill={C.forest} />
      <path d="M66 57H94V95C94 99 91 102 87 102H73C69 102 66 99 66 95Z" fill={C.sheet} stroke={C.forest} strokeOpacity="0.25" strokeWidth="2" />
      <path d="M68 76H92V95C92 98 90 100 87 100H73C70 100 68 98 68 95Z" fill={C.bread} />
      {/* sack */}
      <path d="M104 60C100 60 98 64 100 68L96 96C95 100 98 102 102 102H118C122 102 125 100 124 96L120 68C122 64 120 60 116 60Z" fill={C.leaf} />
      <path d="M102 64H118" stroke={C.forest} strokeWidth="3" strokeLinecap="round" />
      <path d="M110 74c-4 6-4 12 0 16 4-4 4-10 0-16Z" fill={C.cream} opacity="0.7" />
    </Spot>
  );
}

// Recipe pages: a slim journal rule with a sprig at its centre
export function SprigDivider({ className = "" }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-4 ${className}`}>
      <span className="h-px flex-1 bg-forest/15" />
      <svg viewBox="0 0 56 20" className="h-7 w-auto shrink-0">
        <path d="M6 14C18 12 32 9 50 6" fill="none" stroke={C.leaf} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M20 12C17 7 18 3 22 1 24 5 23 9 20 12Z" fill={C.leaf} />
        <path d="M30 10C33 5 37 4 41 5 39 9 35 11 30 10Z" fill={C.leafLight} />
        <path d="M28 10C24 13 19 14 15 13 18 10 22 9 28 10Z" fill={C.leafLight} />
        <circle cx="50" cy="6" r="2.6" fill={C.pink} />
      </svg>
      <span className="h-px flex-1 bg-forest/15" />
    </div>
  );
}
