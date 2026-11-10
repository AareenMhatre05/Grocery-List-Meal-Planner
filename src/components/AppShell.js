import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { signOut } from "firebase/auth";
import { House, CalendarDays, ChefHat, ShoppingBasket, Refrigerator, UserRound, LogOut } from "lucide-react";
import { auth } from "../firebase";
import { useStoredState, KEYS } from "../lib/storage";
import { cx } from "../ui/ui";
import { BrandIcon, BrandWordmark } from "../ui/Brand";

export const NAV = [
  { to: "/", label: "Today", short: "Today", icon: House, end: true },
  { to: "/planner", label: "Week planner", short: "Planner", icon: CalendarDays },
  { to: "/meals", label: "Recipes", short: "Recipes", icon: ChefHat },
  { to: "/grocery", label: "Grocery list", short: "List", icon: ShoppingBasket, count: true },
  { to: "/pantry", label: "Pantry", short: "Pantry", icon: Refrigerator },
];

// Brand lockup: icon + wordmark (same drawing as public/logo.svg).
// tone "cream" for forest backgrounds; "forest" uses the light-background version.
// layout "stacked" (two lines) for the rail and login; "inline" for the 56px mobile bar.
const LOGO_SIZES = {
  sm: { icon: 32, wordmark: 16, gap: "gap-2.5" },
  md: { icon: 44, wordmark: 38, gap: "gap-3" },
  lg: { icon: 56, wordmark: 50, gap: "gap-4" },
};

export function Logo({ tone = "cream", layout = "stacked", size }) {
  const onForest = tone === "cream";
  const s = LOGO_SIZES[size || (layout === "inline" ? "sm" : "md")];
  return (
    <span className={cx("flex items-center", s.gap)}>
      <BrandIcon size={s.icon} onLight={!onForest} className="shrink-0" />
      <BrandWordmark layout={layout} height={s.wordmark} className={cx("shrink-0", onForest ? "text-cream" : "text-forest")} />
      <span className="sr-only">Grocery &amp; Meal Planner</span>
    </span>
  );
}

function useRemaining() {
  const [list] = useStoredState(KEYS.grocery, []);
  return list.filter((i) => !i.done).length;
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const remaining = useRemaining();
  const reduce = useReducedMotion();
  // One pink count per screen: on the dashboard, "Still to buy" carries it
  const badgeTone = location.pathname === "/" ? "bg-cream text-forest" : "bg-pink text-forest-900";

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-forest focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>

      {/* Desktop rail */}
      <aside className="on-forest hidden bg-forest lg:block">
        <div className="sticky top-0 flex h-screen flex-col px-4 pb-4 pt-6">
        <NavLink to="/" className="rounded px-2" aria-label="Grocery & Meal Planner, today">
          <Logo />
        </NavLink>

        <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  "press group flex h-10 items-center gap-3 rounded px-3 text-[0.9375rem]",
                  isActive ? "bg-forest-600 font-medium text-cream" : "text-cream/75 hover:bg-forest-600/60 hover:text-cream"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.count && remaining > 0 && (
                    <span className={cx("tnum min-w-[1.5rem] rounded-sm px-1.5 text-center text-xs font-semibold leading-5", badgeTone)} aria-label={`${remaining} to buy`}>
                      {remaining}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-cream/10 pt-4">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cx("press flex h-10 items-center gap-3 rounded px-3 text-[0.9375rem]", isActive ? "bg-forest-600 font-medium text-cream" : "text-cream/75 hover:bg-forest-600/60 hover:text-cream")
            }
          >
            <UserRound size={18} strokeWidth={1.75} aria-hidden />
            Profile
          </NavLink>
          <button type="button" onClick={handleLogout} className="press flex h-10 items-center gap-3 rounded px-3 text-left text-[0.9375rem] text-cream/75 hover:bg-forest-600/60 hover:text-cream">
            <LogOut size={18} strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="on-forest sticky top-0 z-30 flex h-14 items-center justify-between bg-forest px-4 lg:hidden">
        <NavLink to="/" aria-label="Grocery & Meal Planner, today" className="rounded">
          <Logo layout="inline" />
        </NavLink>
        <NavLink
          to="/profile"
          aria-label="Profile"
          className={({ isActive }) => cx("press flex h-10 w-10 items-center justify-center rounded", isActive ? "bg-forest-600 text-cream" : "text-cream/80 hover:bg-forest-600/60")}
        >
          <UserRound size={20} strokeWidth={1.75} aria-hidden />
        </NavLink>
      </header>

      <main id="main" className="mx-auto w-full max-w-page px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: reduce ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
        >
          <Outlet context={{ onLogout: handleLogout }} />
        </motion.div>
      </main>

      {/* Mobile tab bar */}
      <nav aria-label="Main" className="on-forest fixed inset-x-0 bottom-0 z-30 border-t border-cream/10 bg-forest pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => cx("relative flex h-16 flex-col items-center justify-center gap-1 text-xs", isActive ? "font-medium text-cream" : "text-cream/70")}
              >
                {({ isActive }) => (
                  <>
                    <span className={cx("relative flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-fast", isActive && "bg-forest-600")}>
                      <item.icon size={20} strokeWidth={1.75} aria-hidden />
                      {item.count && remaining > 0 && (
                        <span className={cx("tnum absolute -right-0.5 -top-1 min-w-[1.125rem] rounded-full px-1 text-center text-[0.6875rem] font-semibold leading-[1.125rem]", badgeTone)}>
                          {remaining}
                        </span>
                      )}
                    </span>
                    {item.short}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
