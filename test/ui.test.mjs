import test from "node:test";
import assert from "node:assert/strict";
import {
  buildViewModel,
  renderWeekStripHtml,
  renderThemePickerHtml,
  containsForbiddenCopy,
  IMPORT_ERROR_MESSAGE
} from "../src/app.js";

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

test("renderWeekStripHtml does not repeat reminder text in chips", () => {
  const state = { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} };
  const html = renderWeekStripHtml(buildViewModel(state));
  // Reminder text ("给耳朵一点新输入") should appear in the card, not in chips
  assert.equal(html.includes("给耳朵一点新输入"), false);
  assert.equal(html.includes("让脖子和肩背松一点"), false);
});

test("renderThemePickerHtml renders seven theme choices", () => {
  const state = { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} };
  const html = renderThemePickerHtml(buildViewModel(state));
  assert.equal((html.match(/data-theme-id=/g) ?? []).length, 7);
  assert.equal(html.includes("耳朵日"), true);
  assert.equal(html.includes("眼睛日"), true);
  assert.equal(containsForbiddenCopy(html), false);
});

test("UI copy excludes forbidden task language", () => {
  const state = { schemaVersion: 1, selectedDate: "2026-07-08", dailyRecordsByDate: {} };
  const view = buildViewModel(state);
  assert.equal(containsForbiddenCopy(JSON.stringify(view)), false);
});

test("import error message avoids forbidden task language", () => {
  assert.equal(containsForbiddenCopy(IMPORT_ERROR_MESSAGE), false);
});
