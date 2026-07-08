/**
 * MyDays — Date utility functions.
 *
 * Pure functions operating on ISO date strings ("YYYY-MM-DD") with no
 * external dependencies.
 *
 * @module dates
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse an ISO date string into a local-midnight Date object.
 * Using "T00:00:00" ensures the Date is interpreted in local time, avoiding
 * the UTC-only parsing that bare ISO strings trigger in the ECMAScript spec.
 *
 * @param {string} dateStr — ISO date ("YYYY-MM-DD")
 * @returns {Date}
 */
function toLocalDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

/**
 * Format a Date object back into an ISO date string ("YYYY-MM-DD").
 *
 * @param {Date} date
 * @returns {string}
 */
function toIsoDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Return the seven ISO date strings (Monday → Sunday) for the week that
 * contains the given date.
 *
 * @param {string} dateStr — ISO date ("YYYY-MM-DD")
 * @returns {string[]} — seven date strings, Monday first
 */
export function getIsoWeekDates(dateStr) {
  const date = toLocalDate(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, …, 6 = Saturday

  // Offset from the given date back to the preceding (or current) Monday.
  // Sunday (0) needs to go back 6 days; Mon–Sat subtract (dayOfWeek - 1).
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(toIsoDateStr(d));
  }
  return week;
}

/**
 * Return the ISO weekday number (1 = Monday … 7 = Sunday) for the given
 * date.
 *
 * @param {string} dateStr — ISO date ("YYYY-MM-DD")
 * @returns {number} — 1–7
 */
export function getIsoWeekday(dateStr) {
  const date = toLocalDate(dateStr);
  const jsDay = date.getDay(); // 0 = Sunday
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Format an ISO date as a Chinese-locale full date string.
 *
 * @param {string} dateStr — ISO date ("YYYY-MM-DD")
 * @returns {string} — e.g. "2026年7月8日"
 */
export function formatFullDate(dateStr) {
  const [, y, m, d] = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/**
 * Format an ISO date as a short chip label (MM.DD).
 *
 * @param {string} dateStr — ISO date ("YYYY-MM-DD")
 * @returns {string} — e.g. "07.08"
 */
export function formatChipDate(dateStr) {
  const [, , m, d] = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return `${m}.${d}`;
}
