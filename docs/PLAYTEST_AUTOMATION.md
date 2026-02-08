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
| Toggle map (button) | `map-toggle` |
| Explored map (panel when map shown) | `explored-map` — shows all areas explored so far; grows as player moves. |
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
| Trade panel / Close | `trade-panel`, `trade-panel-close` |
| Trade merchant button | `trade-merchant-{merchantId}` |
| Buy / Sell buttons | `trade-buy-{itemId}`, `trade-sell-{itemId}` |

## Query params (dev / test)

| Param | Effect |
|-------|--------|
| `?simulateInitError=1` | Forces init to fail so the Loading overlay shows and **Retry** (`loading-retry`) can be tested. |
| `?forceEnemy=1` | Adds one random enemy to the starting room so **Combat** and **Concession** flows can be tested without relying on random room generation. |
| `?lowHp=1` | Sets player HP to 5 at init. Use with `forceEnemy=1` so an enemy hit that would take you out triggers the **Concession** modal (RNG: enemy must land a hit; may need several ENGAGEs). |
| `?forceMerchant=1` | Adds one merchant to the starting room so **Trading** can be tested (60% chance by default). |
| `?deterministic=1` | **Deterministic starting state:** Ranger (Ashwalker), level 1, full health (24 HP), basic equip, no progress flags; start room has no random allies or merchants. Use for reliable playtest automation. |

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

**Improvements this pass:** SCAN readout now includes **Allies** (e.g. Fellow Ranger or "None") so reconnaissance discovers non-hostile NPCs per Familiar design. **Deterministic starting state** added: `?deterministic=1` gives ranger, level 1, full health (24 HP), basic equip, no progress flags, and a start room with no random allies/merchants for reliable playtest automation. **relatedNpcIds** populated: the main thread's `relatedNpcIds` is synced from the current room's allies + merchants on init, move, and after Oracle/COMMUNE (Entering the Red, Enter Stage Left). **Vignette threadIds** wired: starting a vignette passes the current main thread (or all threads) into `vignette.threadIds`; VignetteControls shows "Threads: …" when a vignette is active.

### What was tested

| Flow | How to reproduce | Status |
|------|------------------|--------|
| **Init** | Load `http://localhost:3000` → wait for "Connection Stable" | ✅ Store Room, Reconnaissance thread, Neural Log entries |
| **Movement** | Click Move East/South/North/West (enabled per room exits) | ✅ Room title/description and log update (e.g. "Moved East." → Acid Pit) |
| **Map toggle** | Click "Toggle map" | ✅ **Explored map:** Shows a grid of all areas visited this session (start room at center, grows N/S/E/W as player moves). Current room highlighted "You are here". Movement still works after toggle. |
| **SCAN** | Click "Scan sector" | ✅ Log: biome, hazards, **allies** (e.g. Fellow Ranger), hostiles (name, HP), exits |
| **ENGAGE** | With hostiles in room (or `?forceEnemy=1`), click "Engage enemy" | ✅ Duel message + enemy counter-attack; enemy HP decreases or "has fallen" |
| **COMMUNE** | Click "Commune with void" | ✅ Log "You attempt to commune with the void..."; Oracle answer and facts added |
| **Oracle** | Type question in "Ask Oracle", click Send (or Enter) | ✅ Log "Your Question: …", then "Oracle: … (Roll: …, Surge: …)"; Facts panel gets entry |
| **Facts panel** | After Oracle or COMMUNE, click "Open Facts" (aria-label when closed) | ✅ Panel shows fact list; button becomes "Close Facts" |
| **Stage selector** | Click "Stage: Knowledge" / "Stage: Conflict" / "Stage: Endings" | ✅ Stage updates (Oracle/COMMUNE use current stage) |
| **Vignette** | Enter theme in "Vignette theme", click "Start vignette" | ✅ **Logged:** Start/Advance/End actions now appear in Neural Log. |
| **Fade out scene** | With a current scene, click "Fade out" in footer | ✅ (Scene id present when room + thread established) |
| **Loading / Retry** | Load `?simulateInitError=1` | ✅ "Simulated init failure." + "Retry initialization" (aria-label); Retry re-runs init (fails again while param set) |
| **Concession** | `?lowHp=1&forceEnemy=1`, ENGAGE until enemy hit would take player out | ✅ **Death implemented:** Rejecting concession at 0 HP logs death, clears room enemies, and respawns player (full HP). |
| **Level generation** | Move to new rooms (N/S/E/W); SCAN in each | ✅ Biomes: Quadar Tower (start), Ethereal Marshlands, Toxic Wastes, Haunted Chapel, Obsidian Spire. Room titles vary by biome (e.g. Acid Pit, Ghost Swamp). ~30% chance of one hostile per room; exits random. |
| **Hazards** | SCAN in rooms; or COMMUNE until Loom returns "unexpectedly" + **Entering the Red** | ✅ **Toxic Air:** 20% on room generation (engine). **Threat Imminent:** added to current room when COMMUNE returns "No/Yes, and unexpectedly" with Table 2 "Entering the Red" (Familiar: threat of danger or combat). |
| **NPCs (Fellow Ranger)** | Start room has 40% chance; or COMMUNE until "unexpectedly" + **Enter Stage Left** | ✅ **Start:** `generateStartRoom()` adds Fellow Ranger 40% of the time; visible in RoomViewport and SCAN readout. **Enter Stage Left:** COMMUNE Loom "unexpectedly" + Table 2 "Enter Stage Left" adds Fellow Ranger or Merchant to current room. |
| **Merchants / Trading** | Load with `?forceMerchant=1` or find merchant (60% in Store Room, 15% in other rooms); click "Trade" | ✅ Nomadic traders (Gloamstrider, Twilightrider, Emberogue) with wares. TradePanel: Buy (take from merchant), Sell (give to merchant). Log entries for trades. SCAN reports Merchants. |

### Reproduction steps (cursor-ide-browser)

1. **Stale refs:** Snapshot → find ref → single action (click/type) → snapshot again before next action.
2. **Facts:** Ask Oracle or COMMUNE first so facts exist; then target "Open Facts" (or "Close Facts" when open).
3. **Concession:** Navigate to `http://localhost:3000/?lowHp=1&forceEnemy=1`, then repeatedly click "Engage enemy" until either the Concession modal appears (enemy lands a killing hit) or the enemy is defeated.
4. **Hazard "Threat Imminent":** Be in any room, click "Commune with void" repeatedly until the Oracle returns an answer with "[EVENT: Entering the Red]". SCAN or check room view to see "Threat Imminent" in hazards (or an enemy may be added instead, 50% each).
5. **Fellow Ranger (Enter Stage Left):** Be in a room without a Fellow Ranger, click "Commune with void" until the Oracle returns "[EVENT: Enter Stage Left]". RoomViewport and SCAN will show "Fellow Ranger".

### Known issues / notes

- **Auto-play:** Not exercised in this pass; doc and `autoPlayTick` list valid actions and concession handling.
- **SCAN allies:** As of this pass, SCAN readout includes "Allies: …" (e.g. Fellow Ranger or "None") so reconnaissance discovers non-hostile NPCs (Familiar alignment).
- **Merchants / Trading implemented:** Nomadic traders (Gloamstrider, Twilightrider, Emberogue) spawn in Store Room (60%) and randomly in rooms (15%). Enter Stage Left can add a merchant (50% vs Fellow Ranger). Click "Trade" on merchant → TradePanel: buy wares (Barter), sell from inventory. SCAN reports Merchants. See `trade-panel`, `trade-merchant-*`, `trade-buy-*`, `trade-sell-*`.
- **Not yet implemented (in scope for future):** Quests (reconnaissance objective, rescue lost rangers), Session completion/Scoring. Focus remains web client single-player mechanics; no multiplayer, tests, backend, or Expo.
- **Item effects:** Weapons, spells, and upgrades purchased from merchants do not yet affect combat, stats, or abilities. Items are inventory-only (flavor); no equip system, no stat bonuses, no spell acquisition from merchants, no consumable effects. quadar.md: merchants sell these for improving skills/spells; implementation pending.
- **Deterministic starting state:** Implemented. Use `?deterministic=1`: starting character is ranger (Ashwalker), level 1, full health (24 HP), basic equip, no progress flags; start room has no random allies or merchants. Other query params (e.g. `forceEnemy`, `forceMerchant`, `lowHp`) still apply when set.
- **Threads, Vignette, GameScreen, rooms, NPCs tie together:** **relatedNpcIds** is now populated (see above). **Vignette threadIds** is now wired: on "Start vignette", the main thread (or all threads) is passed into `vignette.threadIds` and shown in the UI ("Threads: Reconnaissance"). Scene–room links (`locationRoomId`) are not yet surfaced in the UI; RoomViewport does not yet reflect the current thread or vignette. Further integration (scene–room in UI) remains in scope.
- **Story integration:** Movement, combat, level generation, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, level progression, and experience should all tie together as part of the story. Gameplay systems should feed into narrative and vice versa — e.g. defeating enemies yields commodities for merchants, exploring rooms advances quests, vignettes and threads reflect what happens in combat and trade, level-up unlocks new abilities. Implement so the story emerges from and drives these mechanics.

---

## Task (prompt for new chat) - Make sure to keep updated.

Act as an expert Game Developer and QA Engineer. Fully test all single-player gameplay for the Qua'dar game and make improvements. Keep `docs/PLAYTEST_AUTOMATION.md` up to date.

**Target:**
- **Codebase:** `/Users/seandinwiddie/GitHub/Forboc.AI/Platform`
- **Running at:** `http://localhost:3000`

**References (read first):**
- **Game design / Familiar:** `@Forboc/notes/quadar_ familiar.md` — initialization, d100/d20 tables, modifiers, Speculum, etc.
- **Game world / rules:** `@Forboc/notes/quadar.md` — Qua'dar setting, characters, classes, spells, Umbralyn, Quadar Tower.
- **Code standards:** `@Forboc/notes/ref/standards/technology-maintenance/condensed.md` — FP/Redux, reducer-first. **Do NOT implement:** tests, logging, backend, db, or Expo.
- **Current status:** `@Forboc.AI/Platform/docs/PLAYTEST_AUTOMATION.md` — test coverage, Known issues, reproduction steps.

**Scope:**
- Test and improve **all** single-player gameplay (movement, combat, level generation, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, level progression, experience, session/scoring). **Exclude multiplayer.**

**Implementation targets (from Known issues):**
- **Item effects:** Weapons, spells, and upgrades from merchants do not affect combat/stats/abilities. Implement equip system, stat bonuses, spell acquisition, consumable effects per quadar.md.
- **Deterministic starting state:** Starting character should be ranger, level 1, full health, basic equip, no progress flags — for reliable playtest automation.
- **Threads, Vignette, rooms, NPCs tie together:** Integrate narrative (threads, vignettes, scenes, stages) with spatial (rooms, NPCs). Populate `relatedNpcIds`, use Vignette `threadIds`, surface scene–room links in UI, so GameScreen presents a coherent narrative–spatial experience.
- **Story integration:** Tie movement, combat, level gen, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, XP, and level progression into the story. Gameplay should drive narrative and narrative should drive gameplay (e.g. combat → commodities → merchants; exploration → quests; vignettes reflect combat/trade; level-up unlocks abilities). Story emerges from mechanics.

**Deliverables:**
1. Systematic playthrough of all single-player mechanics.
2. Concrete improvements (bugs, UX, balance, alignment with quadar / quadar_ familiar).
3. `docs/PLAYTEST_AUTOMATION.md` kept current with test coverage, reproduction steps, and Known issues.

**Technical constraints:**
- Follow condensed.md for frontend architecture. No automated tests (Jest/Cypress), logging infra, backend, db, or Expo. Web client only.

**Suggested next steps:**
1. Read PLAYTEST_AUTOMATION.md (What was tested, Known issues) and the referenced design docs.
2. Use browser automation or manual play to verify flows: Init, Movement, SCAN, ENGAGE, COMMUNE, Oracle, Facts, Vignette, Concession, Merchants/Trading, Level generation, Hazards, NPCs.
3. Identify discrepancies vs quadar_ familiar.md and quadar.md.
4. Implement fixes or enhancements; update the doc after each change.

---

**Quick start:** Copy the Task section above into a new chat to run a full playtest cycle. Targets Platform at localhost:3000; references quadar_ familiar, quadar, and condensed.md; excludes multiplayer, tests, logging, backend, db, Expo.