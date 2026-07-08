# Archived Mixed Draft: MyDays PWA Implementation Plan

This file is archived because it mixed the older iOS Calendar / iCalendar design with the newer PWA direction. Use `2026-07-08-mydays-pwa.md` as the canonical implementation plan.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free local-first PWA for the MyDays sensory day side project.

**Architecture:** The app is a static GitHub Pages site. Pure model functions handle themes, date mapping, state migration, export, and import; the browser UI module renders the Today surface, week strip, note field, theme picker, and backup controls. A service worker caches static assets for offline use after first load.

**Tech Stack:** HTML, CSS, vanilla ES modules, browser localStorage, Web App Manifest, Service Worker, Node built-in test runner.

---

## Design Review Summary

Initial design completeness: **4/10**.

Final design completeness after this review: **9/10**.

The plan is now design-ready for V0 implementation. The remaining 1 point is visual uncertainty because the gstack visual designer is not available in this environment, so no mockups were generated. Run a live visual design review after implementation.

### What Already Exists

- SensoryOS knowledge base at `D:\current_program\knowledge\Efforts\SensoryOS`.
- SensoryOS product principle: no checkboxes, no completion state, no guilt.
- SensoryOS taxonomy: 耳朵日, 脖子日, 肚子日, 脑子日, 茧子日, 小狗日, 眼睛日.
- Practical/direct reminder copy from the `.ics` design doc.
- MyDays PRD at `D:\current_program\mydays\PRD.md`.
- Throwaway UI prototype at `D:\current_program\mydays\prototype`, with Variant A chosen as the preferred direction.

No `DESIGN.md` exists yet. This plan defines the V0 design system inline.

### Design Inputs Now Locked

This implementation plan supersedes the iOS Calendar native MVP as the V0 build target. The iOS document remains useful historical context for the taxonomy, low-effort reminder copy, local-first posture, and exportable data mindset, but PWA storage and UI are authoritative for MyDays V0.

The prototype decision is now part of this plan:

- Use Variant A: daily poster surface first, week strip below.
- Keep the page app-like, alive, and tactile through restrained pattern texture on the main day surface.
- Remove literal UI copy that says `不是任务。`.
- Remove `只要一点点就算数`.
- Do not show weekday labels such as `周三`; show concrete dates instead, such as `2026年7月8日` or `07.08`.
- The product may still be anti-task in behavior, but the UI should not keep explaining that principle to the user.

### Not In Scope

- No marketing landing page.
- No dashboard-card mosaic.
- No habit tracking, streaks, coverage metrics, or completion language.
- No push notifications in V0.
- No WeChat Mini Program in V0.
- No iOS Calendar sync in V0.
- No configurable custom themes in V0.
- No 留白日 in V0. Keep the seven-day taxonomy stable; revisit after using the app.

## Product Design Principles

MyDays is an app UI, not a landing page. The first screen is the product.

The interface must feel like a daily state surface:

- It names the day.
- It gives one practical permission slip.
- It lets the user adjust the week without guilt.
- It captures one small note.

The interface must not feel like:

- A calendar.
- A task manager.
- A dashboard.
- A habit tracker.
- A SaaS starter template.

## Information Architecture

The app has one primary screen.

```text
App Shell
├─ Top Bar
│  ├─ MyDays
│  └─ Selected date
├─ Today Surface
│  ├─ Theme name
│  ├─ Practical reminder
│  └─ Primary action: Change today
├─ Week Strip
│  ├─ Mon theme chip
│  ├─ Tue theme chip
│  ├─ Wed theme chip
│  ├─ Thu theme chip
│  ├─ Fri theme chip
│  ├─ Sat theme chip
│  └─ Sun theme chip
├─ One-Line Note
│  ├─ Visible label
│  ├─ Text input
│  └─ Quiet saved state
└─ Utility Area
   ├─ Export backup
   ├─ Import backup
   └─ Add to Home Screen guidance
```

### Hierarchy

If only three things fit on screen, show them in this order:

1. Today’s theme name.
2. Today’s practical reminder.
3. The seven-day week strip.

The note field and backup controls are below the first viewport on small phones. The app must not lead with setup, instructions, or explanation.

### Navigation

There is no route navigation in V0. Week chips act as in-page selection controls. The selected date stays in local state.

## Screen Components

### Top Bar

- Left: `MyDays`.
- Right: selected date in compact form, such as `7月8日 周三`.
- Height: compact, approximately 48-56px.
- No marketing tagline.

### Today Surface

This is the primary interaction, not a decorative card.

- Dominates the first screen.
- Uses the selected theme’s color as the main surface.
- Shows theme name at display scale.
- Shows one practical reminder sentence.
- Includes one visible button: `换今天`.
- Does not include completion, streak, score, or progress language.

### Week Strip

- Seven chips, one per weekday.
- Each chip shows weekday label and theme name.
- Today/selected date has a clear active state.
- Chips are horizontally scrollable on narrow screens if needed.
- Touch target minimum: 44px high.

### Theme Picker

- Opens from `换今天`.
- Presents seven choices as colored rows or large segmented options.
- Uses theme name and one-line reminder preview.
- Selecting a theme changes only the selected date override.
- No modal should trap the user; Escape closes on desktop, tapping outside closes on mobile.

### One-Line Note

- Visible label: `本周备注`.
- Placeholder text is allowed only as secondary hint, never as the only label.
- Maximum recommended input: one sentence.
- The UI may accept longer text, but it should not encourage journaling or task lists.
- Save state should be quiet: `已保存` or no visible message after stable persistence.

### Utility Area

The utility area is visually secondary.

- Export backup.
- Import backup.
- Add to Home Screen guidance.
- Storage privacy note: `数据只保存在这台设备的浏览器里。`

Use native file input for import. Do not build a custom file picker.

## Sensory Day Defaults

Use these V0 defaults.

| ID | Name | Weekday | Anchor | Color Role | Reminder |
| --- | --- | --- | --- | --- | --- |
| ear | 耳朵日 | Monday | Float | Blue | 不是任务。给耳朵一点新输入：一首新歌或一段播客就够。 |
| neck | 脖子日 | Tuesday | Float | Green | 不是任务。让脖子和肩背松一点：拉伸五分钟也算。 |
| belly | 肚子日 | Wednesday | Soft anchor | Orange | 不是任务。给身体一次明确补给：认真吃一顿或喝点有味道的东西。 |
| brain | 脑子日 | Thursday | Float | Indigo | 不是任务。把脑子从工作逻辑里拿出来：读几页文字或安静想一会儿。 |
| callus | 茧子日 | Friday | Float | Ink | 不是任务。离开键盘，用笔写几行，感受纸面的阻力。 |
| dog | 小狗日 | Saturday | Strong anchor | Grass | 不是任务。给福袋一段高质量探索时间，让他跑、闻、决定路线。 |
| eye | 眼睛日 | Sunday | Float | Rose | 不是任务。给眼睛一段新的视觉输入：一集剧、一个纪录片片段或一场电影。 |

## Visual System

### Type

Use a real type stack, not `system-ui` as the primary choice.

```css
--font-display: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
--font-body: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
```

Display text must not scale with viewport width. Use fixed responsive steps with media queries.

### Color Tokens

The app must not have a one-note palette. The selected theme can dominate the Today Surface, but the overall shell stays neutral.

```css
--shell-bg: #f7f7f2;
--ink: #202124;
--muted: #64645f;
--line: #deded6;
--ear: #1d5fd1;
--neck: #15803d;
--belly: #d95f02;
--brain: #4f46e5;
--callus: #3f3f46;
--dog: #0f766e;
--eye: #be185d;
```

All body text must meet 4.5:1 contrast. Theme surfaces may use white or near-white foreground only when contrast passes.

### Shape and Spacing

- Border radius: 8px or less for controls.
- The Today Surface may use 8px radius.
- Do not nest cards inside cards.
- Avoid decorative orbs, blobs, bokeh, SVG waves, and icon-in-circle decoration.
- Use a 4px spacing base: 4, 8, 12, 16, 24, 32.

### Copy Rules

- Use utility language.
- Keep labels short.
- Do not explain the product inside the app.
- Do not use “完成”, “打卡”, “坚持”, “目标”, “进度”, or “失败”.
- The app can say “不是任务。” in reminder copy because that directly protects the product principle.

## Interaction State Coverage

| Feature | Loading | Empty | Error | Success | Partial |
| --- | --- | --- | --- | --- | --- |
| App boot | Show neutral shell with `MyDays` and a quiet loading line. | If no saved state exists, create default week immediately. | If storage throws, show read-only mode and explain that changes cannot persist. | Render selected date and today theme. | If saved state is missing fields, migrate and fill defaults. |
| Today Surface | Reserve stable height so layout does not jump. | Use default weekday theme. | If theme id is unknown, fall back to default weekday theme and show no scary error. | Show theme name, reminder, and `换今天`. | If selected date override exists, show override theme. |
| Week Strip | Render skeleton chips with stable widths. | Always show seven default chips. | If a theme is missing, show the fallback theme name. | Active day is visually clear. | If chip labels overflow, truncate theme name but keep weekday visible. |
| Theme Picker | Button shows pressed/open state. | Always has seven options. | If save fails, keep chosen theme visually selected but show storage warning. | Picker closes and Today Surface updates. | If user reopens, current selected theme is highlighted. |
| Note Field | Input disabled only during state hydration. | Empty note shows visible label and secondary hint. | If save fails, show `未保存，本地存储不可用`. | Quiet saved state or no message after save. | If note is long, field expands up to a small max height without covering controls. |
| Export | Button remains available after state load. | Export defaults if user has no custom data. | If Blob/download fails, show copyable JSON textarea. | Download `mydays-export-YYYY-MM-DD.json`. | Export includes migrated current schema. |
| Import | Native file input. | No file selected means no visible error. | Invalid JSON shows direct message and leaves existing state unchanged. | Imported data renders immediately. | Older schema imports through migration if possible. |
| Offline | Service worker registers quietly. | First visit requires network. | If registration fails, app still works online. | After first load, reload works offline. | If cache update is available, use it next load without interrupting user. |

## User Journey and Emotional Arc

| Step | User Does | User Feels | Plan Specifies |
| --- | --- | --- | --- |
| 1 | Opens Home Screen app in the morning or after work. | Wants orientation without obligation. | Today Surface names the day immediately. |
| 2 | Scans reminder. | Relief: the bar is low and concrete. | Reminder copy starts with “不是任务。” and gives a small action. |
| 3 | Checks week strip. | Feels the week has texture, not only work/weekend. | Seven colored chips remain visible below the Today Surface. |
| 4 | Changes today if energy is different. | Feels agency, not failure. | `换今天` changes the date override with no confirmation burden. |
| 5 | Writes a short note. | Captures reality without starting a journal. | One-line note field, no checklist UI. |
| 6 | Reopens later. | Trusts the app remembers. | localStorage persists override and note. |
| 7 | Exports backup before device/browser changes. | Feels safe. | JSON export/import are visible but secondary. |

Time horizon:

- First 5 seconds: user sees today’s identity.
- First 5 minutes: user can change today and write one note.
- Five-year relationship: user trusts the app because it never becomes a productivity judge.

## AI Slop Risk Controls

This plan is classified as **APP UI**.

Hard rules for implementation:

- Do not build a marketing hero.
- Do not build a three-feature grid.
- Do not center every block of text.
- Do not use icon-in-circle feature cards.
- Do not use purple/blue gradients as the main aesthetic.
- Do not use decorative blobs, waves, or floating shapes.
- Do not turn backup/install into prominent cards in the first viewport.
- Do not use a dashboard mosaic.

Litmus checks before implementation is accepted:

1. Can a user identify today’s sensory theme in under 3 seconds?
2. Is the Today Surface clearly the primary workspace?
3. Are week chips obviously interactive on mobile without hover?
4. Would the page still feel intentional if all shadows were removed?
5. Is every visible control tied to a real personal-use action?

## Responsive and Accessibility Requirements

### Mobile: 360px-430px

- Single column.
- Top Bar stays compact.
- Today Surface appears in first viewport with a hint of Week Strip visible.
- Week Strip may scroll horizontally.
- Theme Picker options are full-width rows.
- Note Field sits below Week Strip.
- Touch targets: 44px minimum.

### Tablet and Desktop: 768px+

- Content max width: 720px.
- Center the app shell, but do not stretch the Today Surface across the whole browser.
- Week Strip can show all seven chips without horizontal scroll.
- Utility Area can become a two-column row only if it does not compete with Today Surface.

### Accessibility

- Use semantic landmarks: `header`, `main`, `section`.
- The active week chip uses `aria-current="date"`.
- Theme picker uses real buttons.
- Note input has a visible `label`.
- Import file input has a visible label.
- Focus outlines must be visible and not removed.
- Keyboard order: Top Bar, Today action, Week Strip, Note, Utility.
- Escape closes Theme Picker.
- Saved/error messages use `aria-live="polite"`.
- Do not rely on color alone; active chips also need shape, weight, or text affordance.

## Data and Persistence Design

### State Shape

Use this conceptual state shape. Tests should verify behavior, not exact internal object layout, unless this shape becomes an exported schema.

```js
{
  schemaVersion: 1,
  selectedDate: "2026-07-08",
  overridesByDate: {
    "2026-07-08": "belly"
  },
  notesByDate: {
    "2026-07-08": "今天只认真吃了一顿饭，但有效。"
  }
}
```

### Backup Format

Export JSON must include:

- `app`: `"mydays"`.
- `schemaVersion`.
- `exportedAt`.
- `state`.

Import must reject JSON when:

- `app` is not `"mydays"`.
- `schemaVersion` is unsupported.
- `state` is not an object.
- Theme ids are unknown and cannot be safely ignored.

## Task 1: Pure Model and Tests

**Files:**
- Create: `package.json`
- Create: `src/model.js`
- Create: `test/model.test.mjs`

- [ ] **Step 1: Write model tests first**

Test these external behaviors:

- Monday week start returns seven ISO dates.
- Default weekday theme lookup matches the SensoryOS taxonomy.
- A date-specific override changes only that date.
- A note is saved and read back by ISO date.
- Export creates an app-tagged JSON payload.
- Import rejects non-MyDays JSON without mutating existing state.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm test
```

Expected: tests fail because `src/model.js` does not exist.

- [ ] **Step 3: Implement model functions**

Implement default theme definitions, date helpers, default state creation, theme resolution, state updates, export, and import.

- [ ] **Step 4: Run tests and verify GREEN**

Run:

```bash
npm test
```

Expected: all model tests pass.

## Task 2: PWA Shell and UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/app.js`
- Create: `manifest.webmanifest`
- Create: `assets/icon.svg`
- Create: `sw.js`

- [ ] **Step 1: Build the static shell**

Create the HTML document, app root, PWA metadata, and script/style links using relative paths for GitHub Pages project hosting.

Required first-load hierarchy:

```text
MyDays / date
Today Surface
Week Strip
One-Line Note
Utility Area
```

- [ ] **Step 2: Build the renderer**

Render:

- Today Surface.
- Week Strip.
- Theme Picker.
- One-Line Note.
- Export/import controls.
- Add to Home Screen guidance.
- Storage privacy note.

- [ ] **Step 3: Wire local persistence**

Load state from localStorage, save every user change, and keep personal notes in the browser only.

Storage key:

```text
mydays.state.v1
```

- [ ] **Step 4: Add offline support**

Register a service worker and cache the static assets needed to reload the app offline.

The service worker should cache:

- `/mydays/`
- `/mydays/index.html`
- `/mydays/styles.css`
- `/mydays/src/model.js`
- `/mydays/src/app.js`
- `/mydays/manifest.webmanifest`
- `/mydays/assets/icon.svg`

Use relative URLs where possible so local testing still works.

## Task 3: Verification and Deployment

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run automated tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run a local static server**

Run:

```bash
python -m http.server 4173
```

Expected: the app serves at `http://localhost:4173/`.

- [ ] **Step 3: Verify browser behavior**

Manual checklist:

- Open local URL.
- Confirm Today Surface is first and dominant.
- Confirm Week Strip is visible without scrolling the whole page on desktop.
- Change today’s theme.
- Write a note.
- Refresh.
- Confirm theme and note persist.
- Export JSON.
- Import invalid JSON and confirm existing state is unchanged.
- Reload after first service worker install and confirm the app still loads.

- [ ] **Step 4: Verify mobile behavior**

Manual iPhone checklist after GitHub Pages deployment:

- Open the GitHub Pages URL in Safari.
- Add to Home Screen.
- Launch from Home Screen.
- Confirm standalone app-like display.
- Change today’s theme.
- Write one note.
- Close and reopen.
- Confirm local state persists.

- [ ] **Step 5: Commit and push**

Run:

```bash
git add .
git commit -m "Build MyDays PWA"
git push
```

Expected: GitHub receives the PWA files on `main`.

## Implementation Tasks

Synthesized from this design review's findings. Each task derives from a specific finding above. Run with Codex; checkbox as you ship.

- [ ] **T1 (P1, human: ~2h / CC: ~15min)** — UI shell — Implement the single-screen information architecture
  - Surfaced by: Information Architecture — original plan named components but did not define hierarchy.
  - Files: `index.html`, `styles.css`, `src/app.js`
  - Verify: local browser shows Top Bar, Today Surface, Week Strip, Note, Utility in that order.
- [ ] **T2 (P1, human: ~2h / CC: ~20min)** — UI states — Implement storage, import, export, and offline states
  - Surfaced by: Interaction State Coverage — original plan did not define loading, empty, error, success, or partial states.
  - Files: `src/model.js`, `src/app.js`, `styles.css`, `sw.js`, `test/model.test.mjs`
  - Verify: `npm test`, plus manual invalid-import and refresh checks.
- [ ] **T3 (P1, human: ~1h / CC: ~10min)** — Visual system — Apply the SensoryOS color and typography rules
  - Surfaced by: AI Slop Risk and Design System Alignment — original plan risked a generic card app.
  - Files: `styles.css`
  - Verify: visual inspection confirms no feature-grid, no decorative blobs, no dashboard mosaic.
- [ ] **T4 (P1, human: ~1h / CC: ~10min)** — Accessibility — Add keyboard, label, focus, and contrast support
  - Surfaced by: Responsive & Accessibility — original plan did not specify interaction affordances.
  - Files: `index.html`, `src/app.js`, `styles.css`
  - Verify: keyboard tab order works, visible labels exist, touch targets are at least 44px.
- [ ] **T5 (P2, human: ~30min / CC: ~5min)** — Docs — Document GitHub Pages and iPhone install flow
  - Surfaced by: User Journey — user needs the PWA to feel installable and personal.
  - Files: `README.md`
  - Verify: README has deploy URL placeholder and iPhone Add to Home Screen steps.

## Completion Summary

```text
+====================================================================+
|         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
+====================================================================+
| System Audit         | No DESIGN.md, UI scope confirmed             |
| Step 0               | Initial rating 4/10                          |
| Pass 1  (Info Arch)  | 4/10 -> 9/10 after hierarchy added           |
| Pass 2  (States)     | 3/10 -> 9/10 after state table added         |
| Pass 3  (Journey)    | 5/10 -> 9/10 after storyboard added          |
| Pass 4  (AI Slop)    | 4/10 -> 9/10 after hard rules added          |
| Pass 5  (Design Sys) | 2/10 -> 8/10 after inline system added       |
| Pass 6  (Responsive) | 3/10 -> 9/10 after viewport/a11y specs       |
| Pass 7  (Decisions)  | 3 resolved, 0 open                           |
+--------------------------------------------------------------------+
| NOT in scope         | written (8 items)                            |
| What already exists  | written                                     |
| TODOS.md updates     | 0 items proposed                             |
| Approved Mockups     | 0 generated, designer unavailable            |
| Decisions made       | 7 added to plan                              |
| Decisions deferred   | 留白日, WeChat Mini Program, Calendar sync   |
| Overall design score | 4/10 -> 9/10                                 |
+====================================================================+
```

Plan is design-complete enough to implement. Run a live `/design-review` after implementation for visual QA.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | not run | Not required for this narrow V0 side project |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | not run | Not run |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | required | Eng review still required before shipping implementation |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clear | score: 4/10 -> 9/10, 7 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | not run | Not required for personal PWA V0 |

**VERDICT:** DESIGN CLEARED — eng review required before shipping implementation.

NO UNRESOLVED DECISIONS
