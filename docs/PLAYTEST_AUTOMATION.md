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
| SCAN / ENGAGE / COMMUNE | `action-scan`, `action-engage`, `action-perform-inquiry` |
| Oracle input / Send | `oracle-input`, `oracle-submit` |
| Stage (Knowledge / Conflict / Endings) | `stage-to-knowledge`, `stage-to-conflict`, `stage-to-endings` (in `stage-selector`) |
| Fade out scene | `fade-out-scene` |
| Facts toggle / panel | `facts-toggle`, `facts-panel` (panel content visible when open; panel hidden when there are no facts—ask Oracle or COMMUNE first to generate facts) |
| Thread buttons | `thread-{threadId}` |
| Vignette theme / Start / Advance / End | `vignette-theme`, `vignette-start`, `vignette-advance-{stage}`, `vignette-end` (e.g. `vignette-advance-rising-action`, `vignette-advance-climax`, `vignette-advance-epilogue`; `{stage}` is kebab-case of next stage name) |
| Concession modal / Accept (flee, etc.) / Reject | `concession-modal`, `concession-accept-flee`, `concession-accept-knocked_away`, `concession-accept-captured`, `concession-accept-other`, `concession-reject` |
| Volume / Music | `volume-up`, `volume-down`, `music-toggle` |
| Player header | `player-header` (displays HP, Stress, Spirit, Blood, Surge) |
| Stage selector | `stage-selector` |
| Thread list | `thread-list` |
| Vignette controls | `vignette-controls` |
| Loading overlay Retry | `loading-retry` (aria-label: "Retry initialization") |
| Neural Log panel | `neural-log-panel` |
| Trade panel / Close | `trade-panel`, `trade-panel-close` |
| Trade merchant button | `trade-merchant-{merchantId}` |
| Buy / Sell buttons | `trade-buy-{itemId}`, `trade-sell-{itemId}` (Buy disabled when insufficient spirit/blood) |
| Inventory toggle | `inventory-toggle` |
| Inventory panel / Close | `inventory-panel`, `inventory-close` |
| Equip / Unequip / Use / Sacrifice | `inventory-equip-{itemId}`, `inventory-unequip-{slot}`, `inventory-use-{itemId}`, `inventory-sacrifice-{itemId}` |
| Quests panel (progress + session score) | `quests-panel` — shows four active quests (Scan 5, Find Fellow Ranger, Defeat 3 hostiles, Trade 2 merchants) and "Session complete" or "Session ended (death)" with score. |
| Skills panel / View skills | `skills-panel`, `skills-toggle`, `skills-panel-close` — View skills button in Action Deck; panel lists unlocked skills. |
| Servitors panel / Toggle / Close | `servitor-toggle`, `servitor-panel`, `servitor-close` — Servitors button in header (visible when a servitor is hired); panel opens from header "View Servitors". |

## Query params (dev / test)

*Note: As of 2026-02-21, all manual testing parameters below EXCEPT `?FORBOCAI_SDK` have been temporarily removed from the codebase. They will be re-implemented via a Developer Console. View `classified/docs/reference/url-parameters.md` for permanent reference.*

| Param | Effect |
|-------|--------|
| `?FORBOCAI_SDK=ON` | **Feature Gate:** Enables the ForbocAI SDK connection. By default, the game uses local procedural logic. |
| `?simulateInitError=1` | Forces init to fail so the Loading overlay shows and **Retry** (`loading-retry`) can be tested. |
| `?forceEnemy=1` | Adds one random enemy to the starting room so **Combat** and **Concession** flows can be tested without relying on random room generation. |
| `?lowHp=1` | Sets player HP to 5 at init. Use with `forceEnemy=1` so an enemy hit that would take you out triggers the **Concession** modal (RNG: enemy must land a hit; may need several ENGAGEs). |
| `?forceMerchant=1` | Adds one merchant to the starting room so **Trading** can be tested (60% chance by default). |
| `?deterministic=1` | **Deterministic starting state:** Ranger (Ashwalker), level 12, full health (120 HP), basic equip, no progress flags; start room has no random allies or merchants. Use for reliable playtest automation. |
| `?autoStart=1` | **Auto-start autoplay:** Skips class selection, auto-initializes game, and begins autoplay loop ~1.5s after init. No manual clicks needed. |
| `?autoFocus=<mode>` | **SDK Focus mode:** Directs autoplay AI to only perform actions in a specific domain. Values: `combat`, `explore`, `trade`, `heal`, `oracle`, `loot`, `baseCamp`, `full` (default, no override). |
| `?autoSpeed=<speed>` | **Tick speed:** `fast` (1s start, accelerates to 200ms), `slow` (5s start, decelerates to 500ms), `normal` (2.8s default, accelerates to 200ms). |

## Layout (for snapshot / scrolling)

The **Stage selector**, **Fade out scene** button, and **Oracle form** (Ask Oracle input + Send) live in a fixed footer strip below the scrollable middle column (Threads, Facts, Vignette, Neural Log). They are always visible without scrolling, so automation can target them by `data-testid` or `aria-label` without scrolling the log into view first. **When Fade out appears:** Clicking "Start vignette" (with at least one thread and current room) dispatches `fadeInScene`, so the Fade out button appears after starting a vignette. A default "Reconnaissance" thread is seeded on first load so vignette + Fade out work without manual thread creation.

## Auto-play

The header **auto-play** button (`auto-play-toggle`, aria-label "Start auto-play" / "Stop auto-play") toggles a mode where the game runs on its own:

-   It simulates a "Relentless Chronicler" who fights (using spells/attacks), heals (using items), equips gear, scans, trades (buy/sell), and communes.
-   Auto-play runs via Redux listener middleware (no component `useEffect`).
-   **SDK Pipeline (Mock):** Each tick calls `getSDKDirective(gameState)` which simulates `Observe → Reason → Act`. The directive (if any) is injected into the behavior tree as Node 0 (highest priority). URL `?autoFocus` controls which domain the mock SDK focuses on.
-   **URL-driven automation:** Use `?autoStart=1&autoFocus=combat&autoSpeed=fast` for fully hands-free testing.
-   **Concession auto-respawn:** When autoplay is on and the player dies (concession modal would open), the store listener auto-dispatches respawn so soak tests run unattended without manual "Reject (Die and Respawn)" click.

Use auto-play for soak testing or to quickly generate log/facts state for manual checks.

---

## Task (prompt for new chat) - Make sure to keep updated.

Act as an expert Game Developer and QA Engineer. Fully test all single-player gameplay for the Qua'dar game and make improvements. Keep `docs/PLAYTEST_AUTOMATION.md` up to date.

**Target:**
- **Codebase:** `/Users/seandinwiddie/GitHub/Forboc.AI/Platform`
- **Running at:** `http://localhost:3000`

**References (read first):**
- **Game design / Familiar:** `@Forboc/notes/quadar_ familiar.md` — initialization, d100/d20 tables, modifiers, Speculum, etc.
- **Game world / rules:** `@Forboc/notes/quadar.md` — Qua'dar setting, characters, classes, spells, Umbralyn, Quadar Tower.
- **Currency / value system:** `@Forboc.AI/Platform/docs/CURRENCY_AUDIT.md` — spirit, blood, sacrifice (qvht/forboc macro vision; trading, sacrifice, gains).
- additional context /Users/seandinwiddie/Documents/GitHub/qvht.github.io /Users/seandinwiddie/Documents/GitHub/forboc.github.io
- **Crafting and farming and looting gathering:** — Itteratively improve. Think a cozy farming sim in the esotiric games Mortal Shell, Shadow of the Colossus, Diablo, Quake, Cyberpunk. Add more types of mushroom (with different effects) within the mushroom growing system.
- **Code standards:** `@Forboc/notes/ref/standards/technology-maintenance/condensed.md` — FP/Redux, reducer-first. **Do NOT implement:** tests, backend, db, or Expo.
- **Current status:** `@Forboc.AI/Platform/docs/PLAYTEST_AUTOMATION.md` — test coverage, Known issues, reproduction steps.

**Scope:**
- Test and improve **all** single-player gameplay (movement, combat, level generation, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, level progression, experience, session/scoring). **Exclude multiplayer.**

do a deep audit of `/Users/seandinwiddie/GitHub/Forboc.AI/Platform` before making any plans.

**Deliverables:**
1. Systematic playthrough of all single-player mechanics.
2. Concrete improvements (bugs, UX, balance, alignment with quadar / quadar_ familiar / forboc / qvht ).
3. `docs/PLAYTEST_AUTOMATION.md` kept current with test coverage, reproduction steps, and Known issues.
4. `docs/todo.md` kept current with forward TODOs per multi session persistence.
5. DO NOT CREATE BLOAT OF OLD WORK. that is stored in git history.
6. `/Users/seandinwiddie/GitHub/Forboc.AI/classified/docs/planning/game-devs/platform` is for reference only. it is not a deliverable. Macro and granular tasks are in the classified docs.

**Technical constraints:**
- Follow condensed.md for frontend architecture. No automated tests (Jest/Cypress), backend, db, or Expo. Web client only.

**Suggested next steps:**
0. Have all file names, folder names, function names, variable names, etc to be lore agnostic. Keep all lore in the ui and ux.
0.5. Make sure the folder/file/function/engineering architecture represents a clear Entity-Component System. reference @Forboc/client/src
0.75. Refactor files into subdomains prioritiezed by line count. keep the top level folder structure of /Users/seandinwiddie/GitHub/Forboc.AI/Platform/src/components/elements/generic, /Users/seandinwiddie/GitHub/Forboc.AI/Platform/src/components/elements/unique, /Users/seandinwiddie/GitHub/Forboc.AI/Platform/src/components/screens, /Users/seandinwiddie/GitHub/Forboc.AI/Platform/src/features. all screen components should be composed of generic and unique components. all unique components should be composed of generic components. refactor as much unique components into generic components as possible. make sure the feature directory uses a Entity-Component System sub organized by domain.
1. Read PLAYTEST_AUTOMATION.md (Known issues) and the referenced design docs.
2. **MANDATORY:** Use the browser tools (e.g. cursor-ide-browser) to open `http://localhost:3000` and verify flows: Init, Movement, SCAN, ENGAGE, COMMUNE, Oracle, Facts, Vignette, Concession, Merchants/Trading/Inventory, Level generation, Hazards, NPCs, autoplay, spells, abilities, weapons, player development, etc. Use the autoplay to test the game and improve the autoplays intelegence of using all features of the game. Autoplay and  npcs should use the same logic, see: /Users/seandinwiddie/GitHub/Forboc/client/src/features. Take a fresh snapshot before each interaction (refs go stale after actions). Take screenshots to confirm UI state. keep /Users/seandinwiddie/GitHub/Forboc.AI/Platform/docs/bot.md up to date as you go along
3. Identify discrepancies vs quadar_ familiar.md and quadar.md.
4. Implement fixes or enhancements (always be improving the gameplay and design); update the doc after each change.
5. Constantly be adding and improving the lore ux from Quadar, Forboc, Qvht.
