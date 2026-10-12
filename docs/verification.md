# Verification

## Wheel enhancement

- `npm run build`, `npm run lint`, and the application TypeScript check pass. The combined suite now has **65 passing cases** (including nested malformed-storage cases).
- Selection tests cover uniform sample grids and fixed-pointer alignment for every roster size from 1 to 24, safe inner-sector landing, immutable stable-ID updates, duplicate-name identity, presence, repeat mode, reset, history bounds, storage validation, and deadline rounding.
- Browser verified the first draw's pointer sector ID (`seed-7`) matched the recorded winner (Johnathan). All eight sectors stayed visible after reveal while seven guests became eligible for the next spin. Every roster/rule control was disabled during animation.
- A second no-repeat pick was Amy; neither the first winner nor an excluded Ross was selected. Adding/removing a temporary guest, duplicate-name rejection, and guest exclusion were exercised. Navigation restored both picks and the guest list while resetting the timer.
- A 30-second timer paused at 00:28, stayed there, resumed, and reached 00:00 / “Time’s up” / Replay. Invalid custom duration 0 was rejected. A simulated 60-second sleep (wall-clock advance plus focus) reconciled a running 30-second timer to completion.
- A single guest renders a full circle and wins normally; the primary action becomes “Start a new round.” With zero present guests, the spin button is disabled and the empty wheel remains valid.
- With a mocked reduced-motion media preference, two spins completed in 368 ms without confetti. Repeat mode correctly picked the sole guest Frank twice. Normal preference was restored afterward.
- Navigating away mid-spin cancelled that draw: returning showed zero history entries, no active spin and an enabled spin button.
- The optional sound toggle responds correctly; audio is disabled initially. No captured JavaScript errors or unhandled rejections during the integration checks.
- Inspected desktop and 390×844 mobile layouts; the mobile document width is exactly 390px, with no horizontal overflow.
- Final production preview completed a draw for Frank with matching pointer ID, timer auto-start, no captured runtime errors, and no external requests. The lazy-loaded wheel JavaScript is about 28 KB (9.3 KB gzip); its styles load separately.
- [Wheel desktop](screenshots/wheel-desktop.png) · [Wheel mobile](screenshots/wheel-mobile.png)

## Automated checks

- `npm run build`: passed, including TypeScript project compilation.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- Race simulation: all 10 cases passed, alongside the wheel cases above in `npm test`. Covers creation, countdown carryover, exact finish ordering, ranking, frame-rate independence, monotonic progress, invalid time steps, pause/reset, empty races, and continuous oval position/heading.
- `node blender/verify_glb.mjs`: passed. Three.js loads the 422,360-byte GLB; 81 meshes / 5,402 triangles; exactly one 0.8-second `Gallop` clip with 20 tracks and matching loop endpoints. Export contains no lights, cameras, or preview floor.

## Browser checks (Ego Chromium)

- Inspected Blender hero and running app visually.
- Desktop: complete scene, distinct runner silks, course controls and leaderboard render.
- Mobile: 390×844; document width remains 390, with no horizontal overflow.
- Meadow, sunset and alpine themes render. Course switching resets the field; course controls lock during active/paused races.
- Broadcast and close follow cameras inspected; runner selection changes the followed horse; free-orbit accepts drag input.
- Countdown starts the race. Pausing at 00:04.1 leaves the clock unchanged while changing selection/camera. Countdown itself also pauses and resumes.
- Reset returns the timer to 00:00.0 and the race to ready.
- A full browser race completed with eight uniquely ranked finishers and monotonically ordered times: 35.04, 35.06, 35.27, 35.51, 35.90, 36.27, 39.38, 41.67 seconds. Winner announcement and “Race again” appeared.
- Spinning-wheel navigation renders the original wheel and shared participant names; returning remounts the race correctly.
- No captured JavaScript errors or unhandled rejections during the final integration checks.
- Production preview: canvas renders; model and local font requests return 200; no external resource requests; no captured runtime errors.

## Visual artifacts

- [Desktop](screenshots/racing-club.png)
- [Mobile alpine](screenshots/mobile-alpine.png)
- [Close follow camera](screenshots/follow-camera.png)
- [Blender horse](../blender/previews/hero.png)
- [Gallop contact sheet](../blender/previews/gallop-contact-sheet.png)

## Non-blocking notices

Vite reports a ~936 KB uncompressed (~256 KB gzip) lazy-loaded 3D chunk. Browserslist reports an old compatibility database. The Node 22.17 test runner warns that type stripping is experimental. These do not fail the checks.
