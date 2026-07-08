/**
 * MyDays — State management helpers.
 *
 * Immutable state module for the MyDays PWA. All state-modifying functions
 * return new objects; the caller-owned state is never mutated.
 *
 * @module state
 */

import { getIsoWeekDates, getIsoWeekday } from "./dates.js";
import { getDefaultThemeIdForWeekday, getThemeById } from "./themes.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a string is a valid ISO date ("YYYY-MM-DD") that represents a
 * real calendar date.
 *
 * @param {string} s
 * @returns {boolean}
 */
function isValidDateStr(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}` === s;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Create a fresh state object for the given selected date.
 *
 * @param {string} selectedDate — ISO date string
 * @returns {import("./state.js").MyDaysState}
 */
export function createState(selectedDate) {
  return {
    schemaVersion: 1,
    selectedDate,
    dailyRecordsByDate: {}
  };
}

/**
 * Return the effective theme id for a given date.
 *
 * If the date has a record with a themeId override, return that. Otherwise
 * fall back to the default weekday theme.
 *
 * @param {import("./state.js").MyDaysState} state
 * @param {string} dateStr — ISO date string
 * @returns {string}
 */
export function getThemeIdForDate(state, dateStr) {
  const record = state.dailyRecordsByDate[dateStr];
  if (record && record.themeId) {
    return record.themeId;
  }
  return getDefaultThemeIdForWeekday(getIsoWeekday(dateStr));
}

/**
 * Immutably set a theme override for a date.
 *
 * If the themeId is unknown (getThemeById returns null), return the state
 * unchanged.
 *
 * @param {import("./state.js").MyDaysState} state
 * @param {string} dateStr — ISO date string
 * @param {string} themeId
 * @param {string} updatedAt — ISO datetime string
 * @returns {import("./state.js").MyDaysState}
 */
export function setThemeForDate(state, dateStr, themeId, updatedAt) {
  if (!getThemeById(themeId)) return state;

  const oldThemeId = getThemeIdForDate(state, dateStr);
  if (oldThemeId === themeId) return state;

  // Build a new dailyRecordsByDate, tracking what changed
  const records = { ...state.dailyRecordsByDate };

  // 1. Remove themeId override from any other date that has it
  for (const [d, record] of Object.entries(records)) {
    if (d !== dateStr && record.themeId === themeId) {
      if (record.note) {
        // Keep the note, strip themeId
        const { themeId: _, ...cleaned } = record;
        records[d] = cleaned;
      } else {
        delete records[d];
      }
    }
  }

  // 2. If the new theme's default weekday falls on a different date
  //    in the same week and that date has no override, swap old theme there
  const theme = getThemeById(themeId);
  const weekDates = getIsoWeekDates(dateStr);
  const defaultDate = weekDates[theme.defaultWeekday - 1];

  if (defaultDate !== dateStr) {
    const existing = records[defaultDate];
    if (!existing || !existing.themeId) {
      // This date's natural theme is being taken — give it the old theme
      records[defaultDate] = {
        ...(existing || {}),
        themeId: oldThemeId,
        updatedAt
      };
    }
  }

  // 3. Set new theme on target date
  const targetExisting = records[dateStr];
  records[dateStr] = { ...(targetExisting || {}), themeId, updatedAt };

  return { ...state, dailyRecordsByDate: records };
}

/**
 * Immutably set a note for a date.
 *
 * Rules:
 * - If note is empty string AND the record has no themeId override, remove the
 *   record entirely.
 * - If note is empty and the record has a themeId override, keep the record
 *   with an empty note.
 * - If note is non-empty, create or update the record.
 *
 * @param {import("./state.js").MyDaysState} state
 * @param {string} dateStr — ISO date string
 * @param {string} note
 * @param {string} updatedAt — ISO datetime string
 * @returns {import("./state.js").MyDaysState}
 */
export function setNoteForDate(state, dateStr, note, updatedAt) {
  const existing = state.dailyRecordsByDate[dateStr];

  if (note === "") {
    // If the record has no themeId override, remove it entirely.
    if (!existing || !existing.themeId) {
      const { [dateStr]: _removed, ...rest } = state.dailyRecordsByDate;
      return { ...state, dailyRecordsByDate: rest };
    }
    // Record has a themeId override — keep it with empty note.
    return {
      ...state,
      dailyRecordsByDate: {
        ...state.dailyRecordsByDate,
        [dateStr]: { ...existing, note: "", updatedAt }
      }
    };
  }

  // Non-empty note — create or update the record.
  const record = {
    ...(existing || {}),
    note,
    updatedAt
  };

  return {
    ...state,
    dailyRecordsByDate: {
      ...state.dailyRecordsByDate,
      [dateStr]: record
    }
  };
}

/**
 * Return the note for a given date, or "" if no record exists.
 *
 * @param {import("./state.js").MyDaysState} state
 * @param {string} dateStr — ISO date string
 * @returns {string}
 */
export function getNoteForDate(state, dateStr) {
  const record = state.dailyRecordsByDate[dateStr];
  return record && record.note ? record.note : "";
}

/**
 * Remove the theme override for a date, falling back to its weekday default.
 *
 * - If the record has a note, keep the record but remove the themeId.
 * - If the record has no note, remove the entire record.
 * - If no override exists, return state unchanged.
 *
 * @param {import("./state.js").MyDaysState} state
 * @param {string} dateStr — ISO date string
 * @returns {import("./state.js").MyDaysState}
 */
export function clearThemeOverride(state, dateStr) {
  const record = state.dailyRecordsByDate[dateStr];
  if (!record || !record.themeId) return state;

  if (record.note) {
    // Keep the record but strip themeId
    const { themeId: _, ...cleaned } = record;
    return {
      ...state,
      dailyRecordsByDate: {
        ...state.dailyRecordsByDate,
        [dateStr]: cleaned
      }
    };
  }

  // No note — remove the record entirely
  const { [dateStr]: _removed, ...rest } = state.dailyRecordsByDate;
  return { ...state, dailyRecordsByDate: rest };
}

/**
 * Serialize the state as an export JSON string.
 *
 * @param {import("./state.js").MyDaysState} state
 * @param {string} exportedAt — ISO datetime string
 * @returns {string} — JSON string
 */
export function exportBackup(state, exportedAt) {
  return JSON.stringify({
    app: "mydays",
    schemaVersion: 1,
    exportedAt,
    state
  });
}

/**
 * Validate and import a backup JSON string.
 *
 * Returns { ok: boolean, state: currentState | importedState }.
 * Rejects when:
 * - app !== "mydays"
 * - schemaVersion !== 1
 * - state is missing / not an object / null
 * - state.selectedDate is not a valid ISO date
 * - any key in dailyRecordsByDate is not a valid ISO date
 * - any record has a themeId that getThemeById cannot resolve
 *
 * @param {import("./state.js").MyDaysState} currentState
 * @param {string} jsonString
 * @returns {{ ok: boolean, state: import("./state.js").MyDaysState }}
 */
export function importBackup(currentState, jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { ok: false, state: currentState };
  }

  // 1. app must be "mydays"
  if (parsed.app !== "mydays") {
    return { ok: false, state: currentState };
  }

  // 2. schemaVersion must be 1
  if (parsed.schemaVersion !== 1) {
    return { ok: false, state: currentState };
  }

  // 3. state must be an object and non-null
  if (!parsed.state || typeof parsed.state !== "object" || Array.isArray(parsed.state)) {
    return { ok: false, state: currentState };
  }

  const imported = parsed.state;

  // 4. selectedDate must be a valid ISO date
  if (typeof imported.selectedDate !== "string" || !isValidDateStr(imported.selectedDate)) {
    return { ok: false, state: currentState };
  }

  // 5. Every key in dailyRecordsByDate must be a valid ISO date
  if (imported.dailyRecordsByDate && typeof imported.dailyRecordsByDate === "object") {
    const keys = Object.keys(imported.dailyRecordsByDate);
    for (const key of keys) {
      if (!isValidDateStr(key)) {
        return { ok: false, state: currentState };
      }
    }

    // 6. Every record with a themeId must have a known theme
    for (const key of keys) {
      const record = imported.dailyRecordsByDate[key];
      if (record && record.themeId && !getThemeById(record.themeId)) {
        return { ok: false, state: currentState };
      }
    }
  } else if (imported.dailyRecordsByDate !== undefined) {
    // If it exists but isn't an object, reject
    return { ok: false, state: currentState };
  }

  return { ok: true, state: imported };
}
