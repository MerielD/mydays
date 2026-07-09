/**
 * MyDays — UI rendering and browser wiring.
 *
 * Pure helper functions (testable in Node) plus browser-side
 * initialisation and event delegation.
 *
 * @module app
 */

import { getIsoWeekDates, getIsoWeekday, formatFullDate, formatChipDate } from "./dates.js";
import { THEMES, getThemeById } from "./themes.js";
import { createState, getThemeIdForDate, setThemeForDate, setNoteForDate, getNoteForDate, exportBackup, importBackup } from "./state.js";
import { loadState, saveState } from "./storage.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORBIDDEN = ["不是任务", "只要一点点就算数", "完成", "打卡", "目标", "进度", "失败"];

export const IMPORT_ERROR_MESSAGE = "导入未成功：备份文件格式不正确。";

// ---------------------------------------------------------------------------
// Pure helpers (testable in Node)
// ---------------------------------------------------------------------------

/**
 * Build a view-model object from app state.
 *
 * @param {import("./state.js").MyDaysState} state
 * @returns {{ fullDate: string, selectedThemeId: string, weekDates: string[], theme: object, chips: Array<{ dateLabel: string, themeId: string, name: string, color: string, reminder: string }> }}
 */
export function buildViewModel(state) {
  const fullDate = formatFullDate(state.selectedDate);
  const selectedThemeId = getThemeIdForDate(state, state.selectedDate);
  const weekDates = getIsoWeekDates(state.selectedDate);
  const theme = getThemeById(selectedThemeId);

  const chips = weekDates.map((date) => {
    const tid = getThemeIdForDate(state, date);
    const t = getThemeById(tid);
    return {
      dateLabel: formatChipDate(date),
      themeId: tid,
      name: t.name,
      color: t.color,
      reminder: t.reminder
    };
  });

  return { fullDate, selectedThemeId, selectedDate: state.selectedDate, weekDates, theme, chips };
}

/**
 * Render the week-strip chip HTML from a view model.
 *
 * @param {{ selectedThemeId: string, chips: Array<{ dateLabel: string, themeId: string, name: string }>, weekDates: string[] }} viewModel
 * @returns {string} — HTML string
 */
export function renderWeekStripHtml(viewModel) {
  return viewModel.chips
    .map((chip, i) => {
      const active = viewModel.weekDates[i] === viewModel.selectedDate ? " active" : "";
      return `<button class="chip${active}" data-date="${viewModel.weekDates[i]}">\n` +
        `            <strong>${chip.dateLabel}</strong>\n` +
        `            <span>${chip.name}</span>\n` +
        `          </button>`;
    })
    .join("\n");
}

/**
 * Return true if the text contains any forbidden task-management word.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function containsForbiddenCopy(text) {
  return FORBIDDEN.some((word) => text.includes(word));
}

/**
 * Render the theme picker row HTML from a view model.
 *
 * @param {{ theme: { id: string } }} viewModel
 * @returns {string} — HTML string
 */
export function renderThemePickerHtml(viewModel) {
  return THEMES.map(
    (theme) => {
      const active = theme.id === viewModel.selectedThemeId ? " active" : "";
      return `<button class="theme-btn${active}" type="button" style="background:${theme.color}" data-theme-id="${theme.id}">${theme.name}</button>`;
    }
  ).join("\n");
}

// ---------------------------------------------------------------------------
// Browser helpers
// ---------------------------------------------------------------------------

/**
 * Escape HTML special characters in a string for safe use as an attribute value.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Return today's date as an ISO date string.
 *
 * @returns {string}
 */
function getTodayIsoStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Mutable module-level state
// ---------------------------------------------------------------------------

/** @type {import("./state.js").MyDaysState} */
let currentState = null;

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

function handleExportClick() {
  const json = exportBackup(currentState, new Date().toISOString());
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mydays-backup-${currentState.selectedDate}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const result = importBackup(currentState, reader.result);
    if (result.ok) {
      currentState = result.state;
      saveState(window.localStorage, currentState);
      renderApp(currentState);
    } else {
      // eslint-disable-next-line no-alert
      alert(IMPORT_ERROR_MESSAGE);
    }
  };
  reader.readAsText(file);
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

/**
 * Render the full app into the DOM.
 *
 * @param {import("./state.js").MyDaysState} state
 */
export function renderApp(state) {
  const view = buildViewModel(state);
  const noteValue = escapeHtml(getNoteForDate(state, state.selectedDate));

  const html = `
    <header class="topbar">
      <div class="brand">MyDays</div>
      <div class="date">${view.fullDate}</div>
    </header>
    <main class="variant variant-a" style="--today: ${view.theme.color}">
      <section class="a-today">
        <div>
          <div class="a-kicker">${view.fullDate}</div>
          <h1 class="a-title">${view.theme.name}</h1>
          <p class="a-copy">${view.theme.reminder}</p>
        </div>
        <div class="a-bottom">
          <button class="btn btn-dark" id="btn-change-theme">换今天</button>
          <div class="a-date-mark">
            <strong>${formatChipDate(state.selectedDate)}</strong>
          </div>
        </div>
      </section>
      <section class="theme-picker" id="theme-picker" aria-label="选择今天">
        ${renderThemePickerHtml(view)}
      </section>
      <section class="week a-week">${renderWeekStripHtml(view)}</section>
      <section class="note a-note">
        <label for="note-input">一句记录</label>
        <input id="note-input" value="${noteValue}" />
      </section>
      <section class="actions">
        <button class="btn" id="btn-export">导出备份</button>
        <button class="btn" id="btn-import">导入备份</button>
        <input type="file" id="import-input" accept=".json" hidden />
        <p class="privacy-note">数据只保存在这台设备的浏览器里</p>
      </section>
    </main>
  `;

  const appEl = document.getElementById("app");
  if (appEl) {
    appEl.innerHTML = html;
  }
}

// ---------------------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------------------

/**
 * Wire all event listeners (called once on init).
 */
function wireEvents() {
  const appEl = document.getElementById("app");

  // Click delegation on the app container
  appEl.addEventListener("click", (e) => {
    // Week chip click — use closest in case click lands on child element
    const chip = e.target.closest(".chip");
    if (chip && chip.dataset.date) {
      const newDate = chip.dataset.date;
      currentState = { ...currentState, selectedDate: newDate };
      renderApp(currentState);
      return;
    }

    // Theme button click — set current date's theme override.
    const themeButton = e.target.closest(".theme-btn");
    if (themeButton && themeButton.dataset.themeId) {
      const themeId = themeButton.dataset.themeId;
      currentState = setThemeForDate(currentState, currentState.selectedDate, themeId, new Date().toISOString());
      saveState(window.localStorage, currentState);
      renderApp(currentState);
      return;
    }

    // "换今天" — open or close the seven-theme picker.
    if (e.target.id === "btn-change-theme") {
      document.getElementById("theme-picker")?.classList.toggle("theme-picker--visible");
      return;
    }

    // Export
    if (e.target.id === "btn-export") {
      handleExportClick();
      return;
    }

    // Import — trigger hidden file input
    if (e.target.id === "btn-import") {
      document.getElementById("import-input").click();
      return;
    }
  });

  // Note input: save on change (blur)
  appEl.addEventListener("change", (e) => {
    if (e.target.id === "note-input") {
      const note = e.target.value;
      currentState = setNoteForDate(currentState, currentState.selectedDate, note, new Date().toISOString());
      saveState(window.localStorage, currentState);
      renderApp(currentState);
    }
  });

  // Import file input: handle file selection
  document.getElementById("import-input").addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleImportFile(e.target.files[0]);
      e.target.value = ""; // allow re-importing the same file
    }
  });

  // Keyboard navigation: arrow keys cycle through week dates
  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

    const weekDates = getIsoWeekDates(currentState.selectedDate);
    const idx = weekDates.indexOf(currentState.selectedDate);

    if (e.key === "ArrowLeft") {
      const newIdx = idx > 0 ? idx - 1 : 6;
      currentState = { ...currentState, selectedDate: weekDates[newIdx] };
      renderApp(currentState);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      const newIdx = idx < 6 ? idx + 1 : 0;
      currentState = { ...currentState, selectedDate: weekDates[newIdx] };
      renderApp(currentState);
      e.preventDefault();
    }
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

/**
 * Initialise the app: load persisted state, render, wire events.
 */
export function initApp() {
  const todayStr = getTodayIsoStr();
  const result = loadState(window.localStorage, todayStr);
  currentState = { ...result.state, selectedDate: todayStr };
  renderApp(currentState);
  wireEvents();
}

// ---------------------------------------------------------------------------
// Auto-init when loaded in a browser
// ---------------------------------------------------------------------------

if (typeof document !== "undefined" && document.getElementById("app")) {
  initApp();
}
