# 3D horse racing

## Wheel enhancement (current task)
1. Create tested wheel selection/session/timer helpers. (complete)
2. Replace wheel with a polished dimensional SVG, smooth spin/reveal, participant management, history and timer. (complete)
3. Verify selection/pointer alignment, no-repeat behavior, navigation, responsive layout, build and tests. (complete)

Design: Racing Club's cream/forest palette, a brass-rimmed fairground wheel, a quiet mint stage, compact guest-list panel, and a dedicated turn timer. Preserve the shared participant source and horse-racing implementation.

Wheel completion evidence: inspected `docs/screenshots/wheel-desktop.png` and `wheel-mobile.png`; all 65 combined test cases, production build, lint (no warnings), and application typecheck pass. Browser verified truthful pointer/winner alignment, roster locking, no-repeat/repeat draws, session restoration, navigation cancellation, zero/single-entry states, reduced motion, timer validation/completion/sleep reconciliation, and no runtime errors. Production wheel also completed a matching draw with timer auto-start and zero external requests. Details in `docs/verification.md`.

## Plan
1. Author and visually verify a stylized Blender horse; export animated GLB. (complete)
2. Build R3F courses, racing simulation, cameras, and polished responsive UI. (complete)
3. Validate model, typecheck/build/lint, and exercise races in browser. (complete)

## Issues resolved
- Installed Blender CLI lacks preview command: local compatibility extension captures real renders.
- Initial patch attempted delete/add of the same file in one call: split operations.
- Existing wheel had an explicit `any` lint error: replaced with participant shape without changing behavior.
- Global Git whitespace settings object to space indentation used by the existing React project; standard trailing-whitespace checks are used instead.

## Completion evidence
- `public/models/horse.glb`, Blender source, inspected hero/contact sheet, and passing GLB validation.
- Three course themes and typed R3F horse/scene mounted in the replacement race UI.
- Production build, lint, typecheck and all 10 tests pass.
- Desktop/mobile, pause/resume/countdown, reset, course/camera switching, full finish and wheel navigation checked in browser.
- Production preview loads model/fonts locally, with no external requests or captured runtime errors.
- `docs/verification.md` records evidence; `docs/screenshots/` contains visual checkpoints.

## Constraints
- Preserve the user's edited participant list and the spinning-wheel game.
- Local, reusable model assets; no external asset dependencies.
- Match finish order to actual race progress; support pause/restart and course selection.

## Race playback speed
- [x] Add an accessible 0.5×–4× selector with responsive layout and live updates.
- [x] Scale simulation, gallop and dust together; preserve countdown timing, pause and results.
- [x] Verify automated tests and desktop/mobile browser behavior; document usage.
- QA note: a parameterized browser viewport wait timed out; inspected actual dimensions and existing 360px minimum, then switched to direct layout checks at supported widths.
