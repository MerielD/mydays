import test from "node:test";
import assert from "node:assert/strict";
import { buildViewModel, renderWeekStripHtml, containsForbiddenCopy } from "../src/app.js";

test("buildViewModel uses concrete selected date and selected theme", () => {
  const state = { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} };
  const view = buildViewModel(state);
  assert.equal(view.fullDate, "2026年7月8日");
  assert.equal(view.selectedThemeId, "belly");
});

test("renderWeekStripHtml renders dates instead of weekday labels", () => {
  const state = { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} };
  const html = renderWeekStripHtml(buildViewModel(state));
  assert.equal(html.includes("07.08"), true);
  assert.equal(html.includes("周三"), false);
});

test("UI copy excludes forbidden task language", () => {
  const state = { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} };
  const view = buildViewModel(state);
  assert.equal(containsForbiddenCopy(JSON.stringify(view)), false);
});
