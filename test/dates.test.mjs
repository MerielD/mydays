import test from "node:test";
import assert from "node:assert/strict";
import { getIsoWeekDates, getIsoWeekday, formatFullDate, formatChipDate } from "../src/dates.js";

test("getIsoWeekDates returns Monday through Sunday for a Wednesday", () => {
  assert.deepEqual(getIsoWeekDates("2026-07-08"), [
    "2026-07-06",
    "2026-07-07",
    "2026-07-08",
    "2026-07-09",
    "2026-07-10",
    "2026-07-11",
    "2026-07-12"
  ]);
});

test("getIsoWeekday maps Monday to 1 and Sunday to 7", () => {
  assert.equal(getIsoWeekday("2026-07-06"), 1);
  assert.equal(getIsoWeekday("2026-07-12"), 7);
});

test("date formatters use concrete dates without weekday labels", () => {
  assert.equal(formatFullDate("2026-07-08"), "2026年7月8日");
  assert.equal(formatChipDate("2026-07-08"), "07.08");
});
