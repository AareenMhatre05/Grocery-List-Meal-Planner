// Local-date helpers. Keys are local YYYY-MM-DD so a plan never shifts a day across time zones.

export function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, n) {
  const next = new Date(date);
  next.setDate(next.getDate() + n);
  return next;
}

// Weeks start on Monday
export function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7;
  return addDays(d, -offset);
}

export function weekDays(start) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(a, b) {
  return toKey(a) === toKey(b);
}

const fmt = (opts) => new Intl.DateTimeFormat("en-IN", opts);
export const formatLong = (d) => fmt({ weekday: "long", day: "numeric", month: "long" }).format(d);
export const formatDayShort = (d) => fmt({ weekday: "short" }).format(d);
export const formatDayMonth = (d) => fmt({ day: "numeric", month: "short" }).format(d);
export const formatWeekday = (d) => fmt({ weekday: "long" }).format(d);

export function formatWeekRange(start) {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const left = sameMonth ? start.getDate() : fmt({ day: "numeric", month: "short" }).format(start);
  return `${left}–${fmt({ day: "numeric", month: "short", year: "numeric" }).format(end)}`;
}
