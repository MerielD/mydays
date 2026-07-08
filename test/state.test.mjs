import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  getThemeIdForDate,
  setThemeForDate,
  setNoteForDate,
  getNoteForDate,
  exportBackup,
  importBackup,
  clearThemeOverride
} from "../src/state.js";

test("createState uses schema v1 and selected date", () => {
  assert.deepEqual(createState("2026-07-08"), {
    schemaVersion: 1,
    selectedDate: "2026-07-08",
    dailyRecordsByDate: {}
  });
});

test("default theme comes from date when no override exists", () => {
  const state = createState("2026-07-08");
  assert.equal(getThemeIdForDate(state, "2026-07-08"), "belly");
});

test("date-specific theme override changes only that date", () => {
  const state = setThemeForDate(createState("2026-07-08"), "2026-07-08", "eye", "2026-07-08T10:00:00.000Z");
  assert.equal(getThemeIdForDate(state, "2026-07-08"), "eye");
  assert.equal(getThemeIdForDate(state, "2026-07-09"), "brain");
});

test("note is saved and read by date", () => {
  const state = setNoteForDate(createState("2026-07-08"), "2026-07-08", "今天认真吃了一顿饭。", "2026-07-08T10:00:00.000Z");
  assert.equal(getNoteForDate(state, "2026-07-08"), "今天认真吃了一顿饭。");
  assert.equal(getNoteForDate(state, "2026-07-09"), "");
});

test("blank note removes an otherwise empty record", () => {
  const withNote = setNoteForDate(createState("2026-07-08"), "2026-07-08", "x", "2026-07-08T10:00:00.000Z");
  const cleared = setNoteForDate(withNote, "2026-07-08", "", "2026-07-08T11:00:00.000Z");
  assert.deepEqual(cleared.dailyRecordsByDate, {});
});

test("exportBackup returns app-tagged v1 JSON", () => {
  const exported = JSON.parse(exportBackup(createState("2026-07-08"), "2026-07-08T10:00:00.000Z"));
  assert.equal(exported.app, "mydays");
  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.exportedAt, "2026-07-08T10:00:00.000Z");
});

test("importBackup rejects non-MyDays JSON without mutating current state", () => {
  const current = createState("2026-07-08");
  const result = importBackup(current, JSON.stringify({ app: "other" }));
  assert.equal(result.ok, false);
  assert.deepEqual(result.state, current);
});

test("importBackup rejects unknown theme ids", () => {
  const current = createState("2026-07-08");
  const payload = {
    app: "mydays",
    schemaVersion: 1,
    exportedAt: "2026-07-08T10:00:00.000Z",
    state: {
      schemaVersion: 1,
      selectedDate: "2026-07-08",
      dailyRecordsByDate: {
        "2026-07-08": { themeId: "unknown", note: "", updatedAt: "2026-07-08T10:00:00.000Z" }
      }
    }
  };
  const result = importBackup(current, JSON.stringify(payload));
  assert.equal(result.ok, false);
  assert.deepEqual(result.state, current);
});

test("clearThemeOverride removes themeId and falls back to weekday default", () => {
  const state = setThemeForDate(createState("2026-07-08"), "2026-07-08", "eye", "2026-07-08T10:00:00.000Z");
  assert.equal(getThemeIdForDate(state, "2026-07-08"), "eye");
  const reset = clearThemeOverride(state, "2026-07-08");
  assert.equal(getThemeIdForDate(reset, "2026-07-08"), "belly");
});

test("clearThemeOverride preserves note when removing themeId", () => {
  const withNote = setNoteForDate(createState("2026-07-08"), "2026-07-08", "some note", "2026-07-08T10:00:00.000Z");
  const both = setThemeForDate(withNote, "2026-07-08", "eye", "2026-07-08T10:00:00.000Z");
  const reset = clearThemeOverride(both, "2026-07-08");
  assert.equal(getThemeIdForDate(reset, "2026-07-08"), "belly");
  assert.equal(getNoteForDate(reset, "2026-07-08"), "some note");
});

test("clearThemeOverride is no-op when no override exists", () => {
  const state = createState("2026-07-08");
  const reset = clearThemeOverride(state, "2026-07-08");
  assert.deepEqual(reset, state);
});
