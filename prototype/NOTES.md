# MyDays UI Prototype Notes

Question answered by this throwaway prototype:

> Which first-screen structure makes MyDays feel like a personal daily-state surface rather than a calendar, task manager, or dashboard?

How to run:

```powershell
cd D:\current_program\mydays
python -m http.server 4173 -d prototype
```

Open:

- `http://localhost:4173/?variant=A`
- `http://localhost:4173/?variant=B`
- `http://localhost:4173/?variant=C`

Variants:

- A — Daily poster: large emotional daily surface, week below.
- B — Compact console: dense, operational, week rail on the side/top.
- C — Week timeline: week rhythm first, today as part of a sequence.

Verdict:

- Pending user review.

Cleanup:

- Delete `prototype/` after choosing a direction.
- Fold the chosen structure back into the real PWA implementation plan or production files.
