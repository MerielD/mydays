/**
 * MyDays sensory theme definitions.
 *
 * Each theme anchors a weekday with a sensory focus area.
 * @module themes
 */

/** @typedef {{ id: string, name: string, defaultWeekday: number, anchor: string, color: string, reminder: string }} Theme */

/** All seven sensory themes in canonical order. @type {readonly Theme[]} */
export const THEMES = Object.freeze([
  {
    id: "ear",
    name: "耳朵日",
    defaultWeekday: 1,
    anchor: "soft",
    color: "#1d5fd1",
    reminder: "给耳朵一点新输入：一首新歌或一段播客就够。"
  },
  {
    id: "neck",
    name: "脖子日",
    defaultWeekday: 2,
    anchor: "soft",
    color: "#15803d",
    reminder: "让脖子和肩背松一点：拉伸五分钟也算。"
  },
  {
    id: "belly",
    name: "肚子日",
    defaultWeekday: 3,
    anchor: "soft",
    color: "#d95f02",
    reminder: "给身体一次明确补给：认真吃一顿或喝点有味道的东西。"
  },
  {
    id: "brain",
    name: "脑子日",
    defaultWeekday: 4,
    anchor: "soft",
    color: "#4f46e5",
    reminder: "把脑子从工作逻辑里拿出来：读几页文字或安静想一会儿。"
  },
  {
    id: "callus",
    name: "茧子日",
    defaultWeekday: 5,
    anchor: "hard",
    color: "#3f3f46",
    reminder: "离开键盘，用笔写几行，感受纸面的阻力。"
  },
  {
    id: "dog",
    name: "小狗日",
    defaultWeekday: 6,
    anchor: "strong",
    color: "#0f766e",
    reminder: "给福袋一段高质量探索时间，让他跑、闻、决定路线。"
  },
  {
    id: "eye",
    name: "眼睛日",
    defaultWeekday: 7,
    anchor: "soft",
    color: "#be185d",
    reminder: "给眼睛一段新的视觉输入：一集剧、一个纪录片片段或一场电影。"
  }
]);

/** Lookup map from theme id to Theme object. */
const byId = Object.fromEntries(THEMES.map((t) => [t.id, t]));

/**
 * Return the default theme id for an ISO weekday number (1=Monday .. 7=Sunday).
 *
 * @param {number} isoWeekday
 * @returns {string}
 */
export function getDefaultThemeIdForWeekday(isoWeekday) {
  const theme = THEMES.find((t) => t.defaultWeekday === isoWeekday);
  return theme ? theme.id : null;
}

/**
 * Return the theme object for a given id, or null if not found.
 *
 * @param {string} id
 * @returns {Theme | null}
 */
export function getThemeById(id) {
  return byId[id] ?? null;
}
