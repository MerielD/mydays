/**
 * MyDays — Storage adapter for browser localStorage.
 *
 * Wraps the Storage API with a generic interface so tests can inject a
 * memory-backed fake.  All functions accept a `storage` object (duck-typed)
 * as the first parameter.
 *
 * @module storage
 */

import { createState } from "./state.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** @type {string} */
export const STORAGE_KEY = "mydays.state.v1";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Serialise `state` to JSON and persist it via `storage.setItem`.
 *
 * @param {Storage} storage — e.g. `window.localStorage`
 * @param {object}  state   — app state object
 * @returns {{ ok: boolean }}
 */
export function saveState(storage, state) {
  try {
    const json = JSON.stringify(state);
    storage.setItem(STORAGE_KEY, json);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Read and deserialise persisted state from `storage.getItem`.
 *
 * Returns the default state (via `createState`) when the store is empty,
 * contains invalid JSON, or holds an object that is missing one of the
 * required top-level keys (`schemaVersion`, `selectedDate`,
 * `dailyRecordsByDate`).
 *
 * @param {Storage} storage     — e.g. `window.localStorage`
 * @param {string}  fallbackDate — ISO date string used for the default state
 * @returns {{ ok: boolean, state: object }}
 */
export function loadState(storage, fallbackDate) {
  const raw = storage.getItem(STORAGE_KEY);

  if (raw === null || raw === "") {
    return { ok: true, state: createState(fallbackDate) };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, state: createState(fallbackDate) };
  }

  // Validate the parsed object has the required shape.
  const requiredKeys = ["schemaVersion", "selectedDate", "dailyRecordsByDate"];
  const hasAllKeys =
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    requiredKeys.every((k) => k in parsed);

  if (!hasAllKeys) {
    return { ok: false, state: createState(fallbackDate) };
  }

  return { ok: true, state: parsed };
}
