export function generateId(): string {
  return crypto.randomUUID();
}

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Get the Monday of the week for a given date string (YYYY-MM-DD)
 */
export function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as start of week
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

/**
 * Format a date string for display (e.g., "Mon, Mar 6")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a week start date for display (e.g., "Week of Mar 6, 2026")
 */
export function formatWeekOf(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return `Week of ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}