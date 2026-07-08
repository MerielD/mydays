import test from "node:test";
import assert from "node:assert/strict";
import { THEMES, getDefaultThemeIdForWeekday, getThemeById } from "../src/themes.js";

test("defines exactly seven sensory themes", () => {
  assert.deepEqual(THEMES.map((theme) => theme.id), [
    "ear",
    "neck",
    "belly",
    "brain",
    "callus",
    "dog",
    "eye"
  ]);
});

test("default weekday mapping matches MyDays V0", () => {
  assert.equal(getDefaultThemeIdForWeekday(1), "ear");
  assert.equal(getDefaultThemeIdForWeekday(2), "neck");
  assert.equal(getDefaultThemeIdForWeekday(3), "belly");
  assert.equal(getDefaultThemeIdForWeekday(4), "brain");
  assert.equal(getDefaultThemeIdForWeekday(5), "callus");
  assert.equal(getDefaultThemeIdForWeekday(6), "dog");
  assert.equal(getDefaultThemeIdForWeekday(7), "eye");
});

test("theme reminders avoid forbidden task-management wording", () => {
  const forbidden = ["不是任务", "只要一点点就算数", "完成", "打卡", "目标", "进度", "失败"];
  for (const theme of THEMES) {
    for (const word of forbidden) {
      assert.equal(theme.reminder.includes(word), false, `${theme.id} includes ${word}`);
    }
  }
});

test("unknown theme id returns null", () => {
  assert.equal(getThemeById("missing"), null);
});
