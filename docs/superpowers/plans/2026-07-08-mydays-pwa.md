# MyDays PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use superpowers:test-driven-development for all production code: write a failing test, verify RED, implement the smallest passing code, verify GREEN, then refactor.

**Goal:** Build MyDays as a static, local-first PWA that can be opened from an iPhone Home Screen and stores all personal data only in the browser.

**Architecture:** MyDays is a GitHub Pages static app. Pure model modules own date math, theme defaults, daily records, export/import, migration, and storage adapters. Browser UI modules render the chosen Variant A daily-poster interface and call the model through small functions. A service worker caches static assets for offline reload after first visit.

**Tech Stack:** HTML, CSS, vanilla ES modules, browser `localStorage`, Web App Manifest, Service Worker, Node built-in test runner.

---

## Source Of Truth

The V0 implementation is the PWA. It is not an iOS Calendar product.

Archived context:

- `D:\current_program\knowledge\Efforts\SensoryOS\SensoryOS 感官日历 PRD.md`
- `D:\current_program\knowledge\Efforts\SensoryOS\SensoryOS iOS Native MVP 设计文档.md`
- `D:\current_program\knowledge\Efforts\SensoryOS\SensoryOS_v1.ics`

Those files explain the original SensoryOS idea, taxonomy, and low-friction philosophy. They do not define the V0 architecture.

V0 explicitly does not use:

- iCalendar / `.ics` as product runtime.
- EventKit.
- Apple Calendar widgets.
- recurring calendar events.
- calendar notes.
- calendar drag-and-drop.
- multiple iPhone calendars for theme colors.

Optional future export can revisit `.ics`, but only after the PWA works well.

## Locked Product Decisions

- Build a local-first PWA hosted on GitHub Pages.
- Keep the public GitHub repo code-only; personal notes never enter the repo.
- Use Variant A from `D:\current_program\mydays\prototype`: daily poster first, week strip below.
- Show dates, not weekday names. Examples: `2026年7月8日`, `07.08`.
- Keep the UI anti-task by behavior. Do not repeat visible copy like `不是任务。`.
- Remove `只要一点点就算数` from UI copy.
- Keep the seven SensoryOS themes for V0.
- Use one short note per date, not checklist items.
- Support changing a date's theme without completion, streak, score, progress, or missed-state language.

## File Structure

Create or modify these files:

- `package.json`: scripts for `npm test`.
- `index.html`: static app shell, metadata, and root landmarks.
- `styles.css`: responsive Variant A visual system.
- `manifest.webmanifest`: PWA metadata for Add to Home Screen.
- `sw.js`: static asset cache for offline reload.
- `src/themes.js`: theme definitions and weekday default mapping.
- `src/dates.js`: ISO date parsing, formatting, and week generation.
- `src/state.js`: app state creation, daily records, migration, import/export.
- `src/storage.js`: localStorage adapter with read-only fallback behavior.
- `src/app.js`: browser rendering and event wiring.
- `test/dates.test.mjs`: date behavior tests.
- `test/themes.test.mjs`: theme definition tests.
- `test/state.test.mjs`: state, migration, import/export tests.
- `test/storage.test.mjs`: storage adapter tests with fake storage.
- `test/ui.test.mjs`: DOM-light rendering tests against pure view helpers.
- `test/pwa.test.mjs`: manifest, service worker, and shell tests.
- `README.md`: GitHub Pages deploy and iPhone install instructions.

Do not create a framework app unless this plan is rewritten. V0 is intentionally dependency-free.

## Domain Model

### Theme

```js
{
  id: "belly",
  name: "肚子日",
  defaultWeekday: 3,
  anchor: "soft",
  color: "#d95f02",
  reminder: "认真吃一顿，或者喝点有味道的东西。"
}
```

`defaultWeekday` uses ISO weekday numbers: Monday `1` through Sunday `7`.

### State

Persist this exported schema under `localStorage` key `mydays.state.v1`.

```js
{
  schemaVersion: 1,
  selectedDate: "2026-07-08",
  dailyRecordsByDate: {
    "2026-07-08": {
      themeId: "belly",
      note: "今天认真吃了一顿饭。",
      updatedAt: "2026-07-08T12:30:00.000Z"
    }
  }
}
```

Rules:

- If a date has no record, use the default theme for that ISO weekday.
- If a date has a record with `themeId`, use that theme for that date only.
- If a date has a record with `note`, show that note for that date only.
- Empty notes are allowed in memory, but persisted records with no theme override and blank note should be removed to keep storage small.
- Unknown theme ids are invalid in import.
- Invalid stored state falls back to a fresh state and does not crash the UI.

### Backup Format

Export JSON shape:

```js
{
  app: "mydays",
  schemaVersion: 1,
  exportedAt: "2026-07-08T12:30:00.000Z",
  state: {
    schemaVersion: 1,
    selectedDate: "2026-07-08",
    dailyRecordsByDate: {}
  }
}
```

Import rejects without mutating current state when:

- `app !== "mydays"`.
- `schemaVersion` is unsupported.
- `state` is missing or not an object.
- `selectedDate` is not `YYYY-MM-DD`.
- `dailyRecordsByDate` contains invalid date keys.
- any record contains an unknown `themeId`.

## Visual And Interaction Spec

### Screen Hierarchy

```text
App Shell
  Top Bar
    MyDays
    selected concrete date
  Today Surface
    theme name
    practical reminder
    Change today button
  Week Strip
    seven date chips
  Note
    visible label
    one short text field
  Utility
    export
    import
    install note
    local privacy note
```

### Copy Rules

Allowed:

- `换今天`
- `一句记录`
- `导出备份`
- `导入备份`
- `数据只保存在这台设备的浏览器里`

Forbidden:

- `不是任务。`
- `只要一点点就算数`
- `完成`
- `打卡`
- `坚持`
- `目标`
- `进度`
- `失败`
- weekday labels such as `周一`, `周二`, `周三`

### Date Display

- Header date: `2026年7月8日`.
- Week chip date: `07.08`.
- Screen reader label may use full ISO date plus theme name.

### Variant A Visual Direction

- The Today Surface is the largest element in the first viewport.
- The selected theme color dominates the Today Surface only.
- Add a restrained repeating-line pattern to the Today Surface so the page feels alive without decorative blobs.
- Keep shell background neutral.
- Do not use gradient blobs, orbs, bokeh, waves, feature-card grids, or marketing hero layout.
- Controls use border radius `8px` or less.
- Touch targets are at least `44px`.

## TDD Plan

Every production module starts with failing tests. Do not write production code for a module before its RED tests exist and have failed for the expected reason.

### Task 1: Test Harness

**Files:**

- Create: `package.json`
- Create: `test/smoke.test.mjs`

- [ ] **Step 1: Write the smoke test**

```js
// test/smoke.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

test("test runner is wired", () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 2: Add test script**

```json
{
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 3: Verify GREEN**

Run:

```bash
npm test
```

Expected: one passing smoke test. This harness task is configuration, so it is the only task that starts green.

### Task 2: Dates Module

**Files:**

- Create: `src/dates.js`
- Create: `test/dates.test.mjs`

- [ ] **Step 1: Write RED tests**

Test cases:

```js
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
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test test/dates.test.mjs
```

Expected: fails because `src/dates.js` does not export the functions.

- [ ] **Step 3: Implement minimal date helpers**

Implement only the exported functions used by the tests.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test test/dates.test.mjs
```

Expected: all date tests pass.

### Task 3: Themes Module

**Files:**

- Create: `src/themes.js`
- Create: `test/themes.test.mjs`

- [ ] **Step 1: Write RED tests**

Test cases:

```js
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
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test test/themes.test.mjs
```

Expected: fails because `src/themes.js` does not exist.

- [ ] **Step 3: Implement theme definitions**

Use seven themes with stable ids, Chinese display names, colors, default weekdays, anchors, and practical reminders.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test test/themes.test.mjs
```

Expected: all theme tests pass.

### Task 4: State Module

**Files:**

- Create: `src/state.js`
- Create: `test/state.test.mjs`

- [ ] **Step 1: Write RED tests**

Test cases:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  getThemeIdForDate,
  setThemeForDate,
  setNoteForDate,
  getNoteForDate,
  exportBackup,
  importBackup
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
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test test/state.test.mjs
```

Expected: fails because `src/state.js` does not exist.

- [ ] **Step 3: Implement immutable state helpers**

Return new state objects. Do not mutate caller-owned state.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test test/state.test.mjs
```

Expected: all state tests pass.

### Task 5: Storage Adapter

**Files:**

- Create: `src/storage.js`
- Create: `test/storage.test.mjs`

- [ ] **Step 1: Write RED tests**

Test cases:

```js
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
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test test/storage.test.mjs
```

Expected: fails because `src/storage.js` does not exist.

- [ ] **Step 3: Implement storage adapter**

Keep storage side effects isolated in this file.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test test/storage.test.mjs
```

Expected: all storage tests pass.

### Task 6: UI Rendering

**Files:**

- Create: `src/app.js`
- Create: `test/ui.test.mjs`
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Write RED tests for render helpers**

Expose small pure helpers from `src/app.js` so UI behavior can be tested without a browser automation dependency.

Test cases:

```js
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
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test test/ui.test.mjs
```

Expected: fails because `src/app.js` does not export the helpers.

- [ ] **Step 3: Implement render helpers and browser wiring**

Build the shell in `index.html`, render into `#app`, and wire:

- `换今天` opens theme picker.
- theme choice calls `setThemeForDate`.
- note input calls `setNoteForDate`.
- week chip changes `selectedDate`.
- export downloads JSON.
- import reads native file input and calls `importBackup`.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test test/ui.test.mjs
```

Expected: all UI helper tests pass.

### Task 7: PWA Offline Assets

**Files:**

- Create: `manifest.webmanifest`
- Create: `sw.js`
- Modify: `index.html`

- [ ] **Step 1: Write static verification tests**

Add `test/pwa.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("manifest uses standalone display and MyDays name", async () => {
  const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
  assert.equal(manifest.name, "MyDays");
  assert.equal(manifest.display, "standalone");
});

test("service worker lists core app assets", async () => {
  const source = await readFile("sw.js", "utf8");
  for (const asset of ["index.html", "styles.css", "src/app.js", "src/state.js", "src/storage.js"]) {
    assert.equal(source.includes(asset), true, `${asset} missing from service worker`);
  }
});

test("index registers manifest and module script", async () => {
  const html = await readFile("index.html", "utf8");
  assert.equal(html.includes("manifest.webmanifest"), true);
  assert.equal(html.includes('type="module"'), true);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test test/pwa.test.mjs
```

Expected: fails until manifest, service worker, and index links exist.

- [ ] **Step 3: Implement PWA files**

Use relative paths so local server and GitHub Pages both work.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test test/pwa.test.mjs
```

Expected: all PWA static tests pass.

### Task 8: Documentation

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Write README acceptance checklist**

README must explain:

- what MyDays is.
- GitHub Pages deployment path.
- iPhone Safari Add to Home Screen flow.
- local-only storage.
- JSON export/import backup.
- `.ics` is not part of V0 runtime.

- [ ] **Step 2: Verify docs manually**

Run:

```powershell
Select-String -LiteralPath README.md -Pattern 'GitHub Pages','Add to Home Screen','local','export','iCalendar'
```

Expected: all terms are present in the README.

## Manual QA

Run after automated tests pass.

```bash
npm test
python -m http.server 4173
```

Open `http://localhost:4173/`.

Desktop checks:

- Today Surface appears first and dominates the page.
- Header shows concrete date, not weekday.
- Week strip shows seven concrete date chips.
- No UI text contains `不是任务`, `只要一点点就算数`, `完成`, `打卡`, `目标`, `进度`, or `失败`.
- Change today's theme, refresh, and confirm it persists.
- Write a note, refresh, and confirm it persists.
- Clear a note, refresh, and confirm it stays cleared.
- Export JSON and confirm it contains `app: "mydays"`.
- Import invalid JSON and confirm existing state is unchanged.
- Keyboard tab order reaches theme picker, week chips, note, export, and import.

IPhone checks after GitHub Pages deployment:

- Open the GitHub Pages URL in Safari.
- Add to Home Screen.
- Launch from Home Screen.
- Confirm app-like standalone display.
- Change today's theme.
- Write one note.
- Close and reopen.
- Confirm local state persists.
- Put phone in airplane mode after first load and confirm the app still opens.

## Deployment

- [ ] Run `npm test`.
- [ ] Run the local server and complete desktop QA.
- [ ] Commit:

```bash
git add .
git commit -m "Build MyDays PWA"
```

- [ ] Push:

```bash
git push
```

- [ ] Enable GitHub Pages for the `main` branch if not already enabled.
- [ ] Run iPhone QA against the deployed URL.

## Self Review Of This Plan

### Architecture

Status: clear.

The plan separates pure model code from browser side effects. Date, theme, state, storage, and UI concerns have distinct files. This makes TDD practical and avoids tying personal data to GitHub or any backend.

### Data Flow

Status: clear.

User action flows from DOM event to model helper to storage adapter to render. Export/import use the same state validation path. Public repo files never contain user notes.

### PWA Versus Calendar

Status: clear.

The plan now explicitly says the iOS Calendar design is archived context only. There is no `.ics`, EventKit, Calendar widget, or calendar-note runtime in V0.

### Test Coverage

Status: strong for V0.

Automated tests cover:

- date math.
- default theme mapping.
- forbidden UI/copy terms.
- state creation.
- daily overrides.
- note writes and clearing.
- backup export.
- import rejection.
- storage read/write/failure.
- core UI render helpers.
- PWA manifest and service worker asset list.

Manual QA covers:

- desktop behavior.
- iPhone Home Screen behavior.
- offline behavior after first load.
- keyboard access.
- persistence.

### Edge Cases

Status: covered enough for V0.

Covered: invalid JSON, unknown theme id, invalid stored state, storage write failure, blank note cleanup, date-specific override isolation, invalid import preserving current state.

Deferred: cloud sync conflicts, cross-browser migration without manual export, custom themes, `.ics` export, WeChat Mini Program port.

### Performance

Status: clear.

The app stores a tiny JSON object in `localStorage`, renders one screen, and has no runtime dependencies. Performance risk is low. The service worker cache is small and static.

### Remaining Risks

- Browser `localStorage` can be cleared by the user or browser. Mitigation: visible JSON export/import.
- iOS PWA storage behavior can vary over long periods of non-use. Mitigation: remind user that backup is manual.
- DOM-light UI tests cannot prove all browser interactions. Mitigation: manual desktop and iPhone QA are required before calling the implementation done.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | not run | Not required for this narrow personal V0 |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | not run | Not run |
| Eng Review | self-review | Architecture, data, tests, edge cases, performance | 1 | clear | PWA-only plan, explicit storage schema, comprehensive TDD matrix |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clear | Variant A selected, first-screen hierarchy locked |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | not run | Not required for personal dependency-free PWA |

**VERDICT:** PWA IMPLEMENTATION PLAN CLEARED. Ready to implement with strict TDD.

NO UNRESOLVED DECISIONS
