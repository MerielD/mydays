---
title: "MyDays PRD"
status: ready-for-agent
created: 2026-07-08
source: "SensoryOS conversation"
---

# MyDays PRD

## Problem Statement

The user wants a personal, low-friction way to reclaim each day from the default “workday vs. weekend” calendar frame. The existing iOS Calendar `.ics` prototype proved the concept of sensory theme days, but it works poorly as the primary interface: calendar colors are tied to calendar layers, event notes feel buried, recurring edits are awkward, and the whole interaction keeps feeling like schedule management rather than a daily state system.

The user does not want a full iPhone app because App Store development is too heavy for a side project. They considered a WeChat Mini Program because they have built one before, but for personal use it still introduces platform and review overhead. The desired product is a small local-first web app/PWA that can be opened from the iPhone Home Screen, hosted from a public GitHub repo, and used privately with personal data stored locally on the device.

## Solution

Build MyDays: a static, local-first PWA for personal sensory day planning.

MyDays gives the user one clear daily surface:

- Today’s sensory theme, shown as a large colored card.
- A practical reminder sentence for what “counts” today.
- A weekly strip of seven sensory days, each with its own color.
- A one-sentence note field for lightweight weekly reflection.
- Simple controls to change today’s theme or adjust the week.
- Local persistence in the browser, with no account and no backend.
- Export/import for backup.

The existing SensoryOS notes remain the knowledge base and product philosophy. MyDays becomes the implementation-side project and public GitHub Pages deployment target.

## User Stories

1. As a personal user, I want to open MyDays from my iPhone Home Screen, so that it feels like a lightweight app without App Store overhead.
2. As a personal user, I want today’s sensory day to be immediately visible, so that I can understand the day’s tone in one glance.
3. As a personal user, I want each sensory day to have a distinct color, so that the week feels visually different from a normal calendar.
4. As a personal user, I want the title to stay short, so that the home screen experience is not cluttered.
5. As a personal user, I want a practical reminder sentence under the title, so that I know the minimum viable version of the day.
6. As a personal user, I want the reminder to say “not a task” in spirit, so that the system does not become another to-do list.
7. As a personal user, I want to see all seven sensory days in a week strip, so that I can feel the rhythm of the week.
8. As a personal user, I want to tap a day in the week strip, so that I can inspect or choose that day’s theme.
9. As a personal user, I want to change today’s theme manually, so that I can respond to my real energy level.
10. As a personal user, I want float days to be easy to swap, so that the system stays flexible.
11. As a personal user, I want strong-anchor days like 小狗日 to remain recognizable, so that weekend rituals keep their place.
12. As a personal user, I want to write one short note for the current day or week, so that I can capture what actually happened without journaling overhead.
13. As a personal user, I want the note field to discourage long checklists, so that I do not turn the system into KPI tracking.
14. As a personal user, I want notes and theme changes to persist locally, so that the app remembers my week.
15. As a personal user, I want the app to work offline after first load, so that it remains usable like a real phone app.
16. As a personal user, I want no login, so that personal use stays private and low-friction.
17. As a personal user, I want no backend, so that there is nothing to maintain.
18. As a personal user, I want the public GitHub repo to contain only app code and default content, so that private notes are never committed.
19. As a personal user, I want to export my local data, so that I can back it up before changing phones or browsers.
20. As a personal user, I want to import a backup, so that I can restore my sensory week.
21. As a personal user, I want the default week to include 耳朵日, 脖子日, 肚子日, 脑子日, 茧子日, 小狗日, and 眼睛日, so that the app starts with the SensoryOS taxonomy.
22. As a personal user, I want the default reminders to be practical and direct, so that they help when I am tired.
23. As a personal user, I want MyDays to avoid checkboxes and completion states, so that I do not feel punished for doing less.
24. As a personal user, I want the app to show a low-effort version of each sensory day, so that even exhausted days can still count.
25. As a personal user, I want a clean mobile-first layout, so that it is comfortable on iPhone.
26. As a personal user, I want desktop support to be acceptable, so that I can edit or test it from a laptop.
27. As a personal user, I want clear install instructions, so that I can add the GitHub Pages URL to my iPhone Home Screen.
28. As a personal user, I want deployment through GitHub Pages, so that hosting is free and simple.
29. As a personal user, I want future optional calendar export, so that I can mirror themes into iOS Calendar if useful later.
30. As a personal user, I want WeChat Mini Program to remain a possible later port, so that I can reuse the model if PWA feels right.

## Implementation Decisions

- Build MyDays as a static PWA, not a native iOS app and not a WeChat Mini Program for V0.
- Host the app from a public GitHub repo using GitHub Pages.
- Keep personal data local to the browser; do not use a backend, account system, database service, analytics, or cloud sync in V0.
- Use the SensoryOS taxonomy as the default content model: 耳朵日, 脖子日, 肚子日, 脑子日, 茧子日, 小狗日, 眼睛日.
- Assign each sensory day a distinct color as product identity, rather than relying on calendar-layer colors.
- Store each sensory day with a stable id, display name, color, reminder sentence, default weekday, anchor behavior, and optional note data.
- Keep the main UI centered on a Today card and a weekly strip.
- Use practical/direct reminder copy, not poetic or abstract copy.
- Do not include checkbox UI, completion status, streaks, or missed-day states.
- Persist local app state using browser storage suitable for a small PWA.
- Include export/import of local data as JSON for backup and migration.
- Add PWA installability basics: manifest, app icon metadata, standalone display mode, and service worker/offline support.
- Keep the SensoryOS knowledge base separate from the MyDays implementation project.
- Treat `.ics` export and WeChat Mini Program packaging as later features, not V0 requirements.

## Testing Decisions

- The primary test seam is the installed/mobile PWA behavior: a user can load the app, see today’s theme, change the theme, write a short note, refresh, and see state preserved.
- Tests should verify external behavior rather than internal implementation details.
- The storage seam should be tested separately enough to prove that default state, saved state, export, and import behave correctly.
- The PWA shell should be tested by verifying that required manifest and service worker assets exist and that offline reload works after first load.
- Accessibility checks should cover readable color contrast, touch-friendly controls, and keyboard-usable controls on desktop.
- Manual mobile verification should be part of acceptance: open the deployed GitHub Pages URL on iPhone Safari, add it to Home Screen, launch it, make a change, close it, reopen it, and confirm persistence.

## Out of Scope

- Native iOS app development.
- WeChat Mini Program implementation.
- App Store release.
- User accounts.
- Backend APIs.
- Cloud sync.
- Push notifications.
- Analytics.
- Social sharing.
- Completion tracking, streaks, or habit scoring.
- Full calendar replacement.
- Automatic iOS Calendar synchronization.
- Multi-user collaboration.

## Further Notes

The product name for the implementation-side project is MyDays. SensoryOS remains the conceptual system and knowledge base. MyDays should feel like a personal operating surface for the week, not a planner, tracker, or productivity dashboard.

