import test from "node:test";
import assert from "node:assert/strict";
import { loadState, saveState, STORAGE_KEY } from "../src/storage.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key)
  };
}

test("saveState writes v1 state to the expected localStorage key", () => {
  const storage = createMemoryStorage();
  const state = { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} };
  const result = saveState(storage, state);
  assert.equal(result.ok, true);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).selectedDate, "2026-07-08");
});

test("loadState returns default state when storage is empty", () => {
  const storage = createMemoryStorage();
  const result = loadState(storage, "2026-07-08");
  assert.equal(result.ok, true);
  assert.equal(result.state.selectedDate, "2026-07-08");
});

test("loadState falls back when stored JSON is invalid", () => {
  const storage = createMemoryStorage();
  storage.setItem(STORAGE_KEY, "{broken");
  const result = loadState(storage, "2026-07-08");
  assert.equal(result.ok, false);
  assert.equal(result.state.selectedDate, "2026-07-08");
});

test("saveState reports read-only mode when storage throws", () => {
  const storage = {
    setItem() {
      throw new Error("quota");
    }
  };
  const result = saveState(storage, { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} });
  assert.equal(result.ok, false);
});
