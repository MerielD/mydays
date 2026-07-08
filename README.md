# MyDays

A local-first PWA for personal sensory day planning.

MyDays gives each day a sensory theme with a distinct color, a practical reminder, and a short note field — no checkboxes, no completion tracking, no scheduling. It is the implementation-side project for the [SensoryOS](https://github.com/MerielD/mydays) concept.

See [PRD.md](PRD.md) for the full product requirements.

---

## Deployment

MyDays is hosted on **GitHub Pages**. The `main` branch deploys automatically — push to `main` to publish.

Repository: [https://github.com/MerielD/mydays](https://github.com/MerielD/mydays)

## Installation (iPhone Safari)

1. Open the MyDays URL in Safari.
2. Tap the **Share** button (square with arrow icon) at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner.

The app will appear on your Home Screen with its own icon and launch in standalone mode.

## Data Storage

All data is stored **locally in your browser** using localStorage. There is no backend, no account, and no cloud sync. Your notes and theme choices never leave your device.

**Important:** Clearing browser data will erase your MyDays data. Use the export feature to back up.

## Backup (Export / Import)

- **Export** — tap the Export button in the app to download a JSON file of all your sensory days, notes, and settings.
- **Import** — tap the Import button and select a previously exported JSON file to restore your data.

Exporting and importing regularly is recommended when switching devices or browsers.

## What Is Not Included (V0)

- **iCalendar (.ics) export** — automatic sync to iOS Calendar / EventKit is not part of the V0 runtime. It may be added in a future version.
- WeChat Mini Program — not included in V0.
- Native iOS app — not planned.
- User accounts, backend APIs, analytics, push notifications — none of these exist in V0.
