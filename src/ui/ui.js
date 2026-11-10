import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

export const cx = (...c) => c.filter(Boolean).join(" ");

const BUTTON = {
  base: "press inline-flex items-center justify-center gap-2 rounded font-medium whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-50",
  size: {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
  },
  variant: {
    primary: "bg-forest text-cream hover:bg-forest-600",
    secondary: "bg-cream-50 text-ink border border-forest/15 hover:border-forest/30 hover:bg-cream-100",
    ghost: "text-ink hover:bg-forest/[0.06]",
    danger: "text-danger hover:bg-danger-soft",
    accent: "bg-pink text-forest-900 hover:bg-pink-300",
  },
};

export const buttonClass = ({ variant = "primary", size = "md", className } = {}) =>
  cx(BUTTON.base, BUTTON.size[size], BUTTON.variant[variant], className);

export const Button = forwardRef(function Button(
  { variant, size, icon: Icon, loading, children, className, type = "button", ...props },
  ref
) {
  return (
    <button ref={ref} type={type} className={buttonClass({ variant, size, className })} disabled={loading || props.disabled} {...props}>
      {loading ? <LoaderCircle size={16} strokeWidth={1.75} className="animate-spin motion-reduce:animate-none" aria-hidden /> : Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ to, variant, size, icon: Icon, children, className, ...props }) {
  return (
    <Link to={to} className={buttonClass({ variant, size, className })} {...props}>
      {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />}
      {children}
    </Link>
  );
}

export function IconButton({ icon: Icon, label, size = "md", tone = "default", className, ...props }) {
  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const tones = {
    default: "text-ink-soft hover:text-ink hover:bg-forest/[0.07]",
    danger: "text-ink-soft hover:text-danger hover:bg-danger-soft",
  };
  return (
    <button type="button" aria-label={label} title={label} className={cx("press inline-flex shrink-0 items-center justify-center rounded", dims, tones[tone], className)} {...props}>
      <Icon size={size === "sm" ? 16 : 18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

export function PageHeader({ title, description, actions, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-2 max-w-[60ch] text-ink-soft">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action, id }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-xl font-semibold tracking-[-0.01em]">{children}</h2>
      {action}
    </div>
  );
}

export function Sheet({ as: Tag = "section", className, children, ...props }) {
  return (
    <Tag className={cx("rounded-xl border border-forest/10 bg-cream-50 shadow-sheet", className)} {...props}>
      {children}
    </Tag>
  );
}

export const inputClass =
  "h-10 w-full rounded border border-forest/20 bg-cream-50 px-3 text-base text-ink transition-colors duration-fast hover:border-forest/35 focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-forest disabled:opacity-60";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cx(inputClass, className)} {...props} />;
});

export function Select({ className, children, ...props }) {
  return (
    <select className={cx(inputClass, "cursor-pointer appearance-none bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: CHEVRON }} {...props}>
      {children}
    </select>
  );
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%231E3B2F' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`;

export function Field({ label, htmlFor, hint, children, className }) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Tag({ children, tone = "neutral", className }) {
  const tones = {
    neutral: "bg-forest/[0.07] text-ink-soft",
    pink: "bg-pink-100 text-pink-700",
    forest: "bg-forest text-cream",
  };
  return <span className={cx("inline-flex h-6 items-center gap-1 rounded-sm px-2 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

// art: an optional spot illustration (src/ui/Spots.js) shown instead of the icon tile,
// for the few empty states where a picture helps; it stays inside this box.
export function EmptyState({ icon: Icon, art, title, children, action, className }) {
  return (
    <div className={cx("flex flex-col items-start gap-3 rounded-xl border border-dashed border-forest/20 px-6 py-8", className)}>
      {art ? <div className="-ml-1 mb-1">{art}</div> : Icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest/[0.07] text-forest-400">
          <Icon size={20} strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <div>
        <p className="font-display text-lg font-semibold text-ink">{title}</p>
        {children && <div className="mt-1 max-w-[52ch] text-ink-soft">{children}</div>}
      </div>
      {action && <div className="mt-1 flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/25 bg-danger-soft/60 px-4 py-3 text-sm text-danger">
      <span>{children}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="press rounded px-2 py-1 font-medium underline hover:bg-danger-soft">
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cx("skeleton", className)} aria-hidden />;
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex h-10 items-center gap-1 rounded-md border border-forest/15 bg-cream-50 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx(
              "press h-8 rounded px-3 text-sm font-medium",
              active ? "bg-forest text-cream" : "text-ink-soft hover:bg-forest/[0.06] hover:text-ink"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Food photo with a calm fallback when the source has none
export function FoodImage({ src, alt, className, ratio = "aspect-[4/3]", fallbackIcon: Icon }) {
  return (
    <div className={cx("relative overflow-hidden bg-cream-300", ratio, className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        Icon && (
          <div className="absolute inset-0 flex items-center justify-center text-forest-300">
            <Icon size={28} strokeWidth={1.5} aria-hidden />
          </div>
        )
      )}
    </div>
  );
}
