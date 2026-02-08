# Playtest automation

## Avoiding stale refs (cursor-ide-browser / snapshot-based automation)

Element refs from a page snapshot become **stale** after any action that updates the page (clicks, navigation, React state updates). To keep automation reliable:

1. **Take a fresh snapshot before every interaction.**  
   Do not reuse refs from an earlier snapshot after you have performed a click, type, or other action.

2. **Resolve the target element from the latest snapshot.**  
   Use the snapshot’s `name` (from `aria-label` or visible text) or structure to find the correct `ref` for the next action.

3. **Use one action per snapshot cycle.**  
   Flow: `snapshot` → find ref for target → `click`/`type`/etc. → `snapshot` → next target → …

All interactive elements in the game UI have:

- **`data-testid`** – for selector-based runners (e.g. `document.querySelector('[data-testid="move-north"]')` or Playwright `getByTestId('move-north')`).
- **`aria-label`** (where applicable) – so the accessibility tree has a stable, unique name for snapshot-based tools.

## data-testid map (for scripts / Playwright)

| Element | data-testid |
|--------|-------------|
| Auto-play toggle | `auto-play-toggle` |
| Move North/West/East/South | `move-north`, `move-west`, `move-east`, `move-south` |
| Toggle map | `map-toggle` |
| SCAN / ENGAGE / COMMUNE | `action-scan`, `action-engage`, `action-commune` |
| Oracle input / Send | `oracle-input`, `oracle-submit` |
| Stage (Knowledge / Conflict / Endings) | `stage-to-knowledge`, `stage-to-conflict`, `stage-to-endings` (in `stage-selector`) |
| Fade out scene | `fade-out-scene` |
| Facts toggle / panel | `facts-toggle`, `facts-panel` (panel content visible when open; panel hidden when there are no facts—ask Oracle or COMMUNE first to generate facts) |
| Thread buttons | `thread-{threadId}` |
| Vignette theme / Start / Advance / End | `vignette-theme`, `vignette-start`, `vignette-advance-{stage}`, `vignette-end` (e.g. `vignette-advance-rising-action`, `vignette-advance-climax`, `vignette-advance-epilogue`; `{stage}` is kebab-case of next stage name) |
| Concession modal / Accept (flee, etc.) / Reject | `concession-modal`, `concession-accept-flee`, `concession-accept-knocked_away`, `concession-accept-captured`, `concession-accept-other`, `concession-reject` |
| Volume / Music | `volume-up`, `volume-down`, `music-toggle` |
| Player header | `player-header` |
| Stage selector | `stage-selector` |
| Thread list | `thread-list` |
| Vignette controls | `vignette-controls` |
| Loading overlay Retry | `loading-retry` (aria-label: "Retry initialization") |
| Neural Log panel | `neural-log-panel` |

## Query params (dev / test)

| Param | Effect |
|-------|--------|
| `?simulateInitError=1` | Forces init to fail so the Loading overlay shows and **Retry** (`loading-retry`) can be tested. |
| `?forceEnemy=1` | Adds one random enemy to the starting room so **Combat** and **Concession** flows can be tested without relying on random room generation. |
| `?lowHp=1` | Sets player HP to 5 at init. Use with `forceEnemy=1` so an enemy hit that would take you out triggers the **Concession** modal (RNG: enemy must land a hit; may need several ENGAGEs). |

## Layout (for snapshot / scrolling)

The **Stage selector**, **Fade out scene** button, and **Oracle form** (Ask Oracle input + Send) live in a fixed footer strip below the scrollable middle column (Threads, Facts, Vignette, Neural Log). They are always visible without scrolling, so automation can target them by `data-testid` or `aria-label` without scrolling the log into view first.

## Auto-play

The header **auto-play** button (`auto-play-toggle`, aria-label "Start auto-play" / "Stop auto-play") toggles a mode where the game runs on its own:

- Every ~2.8 s it performs one random valid action: move (if an exit exists), SCAN, ENGAGE (if hostiles present), COMMUNE, or Ask Oracle (random question).
- If a concession is offered, it randomly Accept or Reject.
- Auto-play runs via Redux listener middleware (no component `useEffect`).

Use auto-play for soak testing or to quickly generate log/facts state for manual checks.

---

## Test coverage (single-player)

**Last playtest:** 2026-02-08. App: Forboc.AI/Platform at `http://localhost:3000`.

### What was tested

| Flow | How to reproduce | Status |
|------|------------------|--------|
| **Init** | Load `http://localhost:3000` → wait for "Connection Stable" | ✅ Store Room, Reconnaissance thread, Neural Log entries |
| **Movement** | Click Move East/South/North/West (enabled per room exits) | ✅ Room title/description and log update (e.g. "Moved East." → Acid Pit) |
| **Map toggle** | Click "Toggle map" | ✅ View switches; movement still works after toggle |
| **SCAN** | Click "Scan sector" | ✅ Log: biome, hazards, hostiles (name, HP), exits |
| **ENGAGE** | With hostiles in room (or `?forceEnemy=1`), click "Engage enemy" | ✅ Duel message + enemy counter-attack; enemy HP decreases or "has fallen" |
| **COMMUNE** | Click "Commune with void" | ✅ Log "You attempt to commune with the void..."; Oracle answer and facts added |
| **Oracle** | Type question in "Ask Oracle", click Send (or Enter) | ✅ Log "Your Question: …", then "Oracle: … (Roll: …, Surge: …)"; Facts panel gets entry |
| **Facts panel** | After Oracle or COMMUNE, click "Open Facts" (aria-label when closed) | ✅ Panel shows fact list; button becomes "Close Facts" |
| **Stage selector** | Click "Stage: Knowledge" / "Stage: Conflict" / "Stage: Endings" | ✅ Stage updates (Oracle/COMMUNE use current stage) |
| **Vignette** | Enter theme in "Vignette theme", click "Start vignette" | ✅ "Theme: … · Stage: Exposition"; "Advance to Rising Action" / "Advance to Climax" / "End vignette" work |
| **Fade out scene** | With a current scene, click "Fade out" in footer | ✅ (Scene id present when room + thread established) |
| **Loading / Retry** | Load `?simulateInitError=1` | ✅ "Simulated init failure." + "Retry initialization" (aria-label); Retry re-runs init (fails again while param set) |
| **Concession** | `?lowHp=1&forceEnemy=1`, ENGAGE until enemy hit would take player out | ⚠️ Code path verified (ConcessionModal, accept/reject); RNG often has enemy miss or die first. Repeat ENGAGE or use auto-play to increase chance. |

### Reproduction steps (cursor-ide-browser)

1. **Stale refs:** Snapshot → find ref → single action (click/type) → snapshot again before next action.
2. **Facts:** Ask Oracle or COMMUNE first so facts exist; then target "Open Facts" (or "Close Facts" when open).
3. **Concession:** Navigate to `http://localhost:3000/?lowHp=1&forceEnemy=1`, then repeatedly click "Engage enemy" until either the Concession modal appears (enemy lands a killing hit) or the enemy is defeated.

### Known issues / notes

- **Concession (single-player):** Modal and accept/reject are implemented; triggering it depends on combat RNG (enemy must land a hit that would reduce player HP to 0). With `lowHp=1` + `forceEnemy=1`, the enemy may be killed before landing a hit. For deterministic concession testing, consider many ENGAGE rounds or a future dev-only option.
- **Auto-play:** Not exercised in this pass; doc and `autoPlayTick` list valid actions and concession handling.

---

**Task:** Fully test all single-player gameplay for the Qua'dar game and make improvements. Keep the automation doc up to date.

**What we're testing:** `/Users/seandinwiddie/GitHub/Forboc.AI/Platform` — the game runs at **http://localhost:3000** (port 3000).

**References (source of truth):**
- **Game design / Familiar system:** `@Forboc/notes/quadar_ familiar.md` — initialization, guidance, questioning, d100/d20 tables, modifiers (And/But/And Unexpectedly), Speculum, etc.
- **Game world / rules:** `@Forboc/notes/quadar.md` — Qua'dar setting, characters (Obsidian Wardens, Doomguards, etc.), classes, spells, Umbralyn, Quadar Tower.
- **Code standards (architecture only):** `@Forboc/notes/ref/standards/technology-maintenance/condensed.md` — follow FP/Redux patterns, presentational components, reducer-first logic, directory structure. **Do NOT implement:** tests, logging, backend, db, or Expo. Use it only for frontend architecture and style.

**Scope:**
- Test and improve **all** single-player gameplay (movement, combat, level generation, hazards, NPCs, wares, quests, session/scoring, etc.). **Exclude multiplayer.**
- After each playtest or change, **update `PLAYTEST_AUTOMATION.md`** in the Platform repo (under `docs/`). Document what was tested, how to reproduce it, any automation steps (e.g. browser/Playwright), and current known issues or improvements.

**Deliverables:**
1. Systematic playthrough of all single-player gameplay.
2. Concrete improvements (bugs, UX, balance, or alignment with quadar / quadar_ familiar).
3. `docs/PLAYTEST_AUTOMATION.md` kept current with test coverage and reproduction steps.

---

please give me a prompt for a new chat to fully test all of the game play and make improvements

note that what we are testing is /Users/seandinwiddie/GitHub/Forboc.AI/Platform

please note to reference @Forboc/notes/quadar_ familiar.md @Forboc/notes/quadar.md and test/implement such futher, except multiplayer, and to reference @Forboc/notes/ref/standards/technology-maintenance/condensed.md except not to implement any tests, logging, backend, db, or expo yet

and that it is running on port 3000 now

and to keep PLAYTEST_AUTOMATION.md up to date.