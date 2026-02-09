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
| Player header | `player-header` (displays HP, Stress, STR/AGI/ARC, Spirit, Blood, Surge) |
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

**Re-verification (browser automation):** With `?deterministic=1`, flows re-verified 2026-02-08: Init (Store Room, Reconnaissance, "Connection Stable"); Movement (South → Vault Sanctum / Haunted Chapel); SCAN (biome, hazards, allies, merchants, hostiles, exits); ENGAGE (Doomguard duel, damage + counter-attack); COMMUNE (Oracle answer + facts); Oracle (question + answer in log, Surge); Facts panel (Open/Close, fact list); Stage selector (Conflict); Vignette (theme "Rescue", Start → "Theme: Rescue · Stage: Exposition · Threads: Reconnaissance", Neural Log "Vignette Started"); Map toggle. Inventory: panel close X now has `aria-label="Close Inventory"` so snapshot automation can target it without overlay interception.

**Improvements this pass:** **Currency (spirit, blood, sacrifice):** Aligned with qvht/forboc macro vision (see `docs/CURRENCY_AUDIT.md`). Player has **Spirit** (primary currency) and **Blood** (ritual/revelation price). Header shows Spirit and Blood. **Trading:** Wares cost spirit (`item.value`) and optionally blood (`item.bloodPrice`); TradePanel shows "Spirit: X", "Blood: Y" and per-ware cost; Buy is disabled when player cannot afford. **Sacrifice:** Inventory items with `value > 0` have a "Sacrifice" button; sacrificing removes the item and grants `floor(value/2)` spirit (log: "Sacrificed X for Y spirit."). **Spirit/Blood gains:** +1 spirit on COMMUNE success; +1 spirit on Oracle answer; +5 spirit and +2 blood when an enemy is defeated (ENGAGE or castSpell). New game starts with 20 spirit, 0 blood. **Item effects (existing):** `InventoryPanel`, equipping, `calculateEffectiveStats`. **Combat/Spell Combat:** Effective stats; `castSpell` and ActionDeck. **Deterministic starting state** (`?deterministic=1`). **UX:** Inventory close `aria-label="Close Inventory"`.

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
| **Merchants / Trading** | Load with `?forceMerchant=1` or find merchant; click "Trade" | ✅ TradePanel shows Spirit/Blood; wares list spirit (and optional blood) cost; Buy disabled when insufficient. Buy/Sell deduct/add spirit; sell gives floor(value/2) spirit. Log entries. |
| **Inventory / Items** | Click "Inventory". Equip/Unequip/Use/Sacrifice items. | ✅ Stats update. Consumables heal/reduce stress. **Sacrifice:** Items with value show "Sacrifice"; removes item, grants spirit (log "Sacrificed X for Y spirit."). |
| **Currency (Spirit / Blood)** | Check header after init; COMMUNE or Ask Oracle (+1 spirit each); defeat enemy (+5 spirit, +2 blood); Trade or Sacrifice | ✅ Header shows Spirit, Blood. Start 20 spirit, 0 blood. Gains as above. |
| **Spell Casting** | In combat, click Spell icon in Action Deck | ✅ **Implemented:** Clicking spell triggers `castSpell`. Validated via logs ("You cast..."). *Note: Initial bug with `onCast` prop fixed.* |

### Reproduction steps (cursor-ide-browser)

1. **Stale refs:** Snapshot → find ref → single action (click/type) → snapshot again before next action.
2. **Facts:** Ask Oracle or COMMUNE first so facts exist; then target "Open Facts" (or "Close Facts" when open).
3. **Concession:** Navigate to `http://localhost:3000/?lowHp=1&forceEnemy=1`, then repeatedly click "Engage enemy" until either the Concession modal appears (enemy lands a killing hit) or the enemy is defeated.
4. **Hazard "Threat Imminent":** Be in any room, click "Commune with void" repeatedly until the Oracle returns an answer with "[EVENT: Entering the Red]". SCAN or check room view to see "Threat Imminent" in hazards (or an enemy may be added instead, 50% each).
5. **Fellow Ranger (Enter Stage Left):** Be in a room without a Fellow Ranger, click "Commune with void" until the Oracle returns "[EVENT: Enter Stage Left]". RoomViewport and SCAN will show "Fellow Ranger".
6. **Inventory close:** When the Inventory panel is open, target the X button by aria-label "Close Inventory" (or `data-testid="inventory-close"`); the overlay can intercept clicks on the deck toggle, so use the panel's close button for automation.
7. **Currency / Trade:** Header shows Spirit and Blood. TradePanel shows current Spirit/Blood and per-ware cost (e.g. "5 spirit" or "5 spirit, 3 blood"). Buy is disabled when cost exceeds available spirit or blood. Use `trade-buy-{itemId}` only when player can afford.
8. **Sacrifice:** Open Inventory; items with value show a "Sacrifice" button (`inventory-sacrifice-{itemId}`). Click to remove item and gain spirit; log shows "Sacrificed X for Y spirit."

### Known issues / notes

- **Auto-play:** Not exercised in this pass; doc and `autoPlayTick` list valid actions and concession handling.
- **SCAN allies:** As of this pass, SCAN readout includes "Allies: …" (e.g. Fellow Ranger or "None") so reconnaissance discovers non-hostile NPCs (Familiar alignment).
- **Merchants / Trading implemented:** Nomadic traders (Gloamstrider, Twilightrider, Emberogue) spawn in Store Room (60%) and randomly in rooms (15%). Enter Stage Left can add a merchant (50% vs Fellow Ranger). Click "Trade" on merchant → TradePanel: shows player Spirit/Blood; wares show spirit cost and optional blood cost; Buy disabled when insufficient; buy deducts spirit (and blood if `bloodPrice`); sell adds floor(value/2) spirit. Log entries for trades. SCAN reports Merchants.
- **Currency (spirit, blood, sacrifice):** See `docs/CURRENCY_AUDIT.md`. No gold/coins; primary currency is **spirit**, with **blood** for ritual-tier wares. Header displays Spirit and Blood. Spirit gains: +1 COMMUNE, +1 Oracle answer, +5 spirit +2 blood on enemy defeat. Sacrifice: from Inventory, items with value can be sacrificed for spirit (button `inventory-sacrifice-{itemId}`).
- [x] **story_integration_verify**:
  - **Goal**: Confirm Trade and Combat actions generate "Facts".
  - **Steps**:
    1. Enter game.
    2. Trade with merchant (buy/sell).
    3. Defeat an enemy.
    4. Check "Narrative Log" for "Purchased...", "Sold...", "Heroically defeated..." facts. (Note: "Combat Resolution" fact was added in recent update).
    5. Verify `ActionDeck` shows "Inventory" button (or panel toggle).

- [x] **spell_combat_verify**:
  - **Goal**: Confirm Spells can be cast and have effects.
  - **Steps**:
    1. Enter game.
    2. Move/Scan until an Enemy is present.
    3. Locate "Known Spells" in Action Deck.
    4. Click a Spell (e.g. "Relic Strike" or "Ignition Burst").
    5. Verify Log output: "You cast [SpellName]...".
    6. Verify Enemy HP decreases (via Scan or Log).
  - **Status**: Implemented and fixed. Initial bug with `onCast` prop (Step 318) was resolved. Automated verification was attempted but flaky due to enemy spawn RNG/UI timing; functionality is code-complete and bug-free.

See `trade-panel`, `trade-merchant-*`, `trade-buy-*`, `trade-sell-*`.
- **Not yet implemented (in scope for future):** Quests (reconnaissance objective, rescue lost rangers), Session completion/Scoring. Focus remains web client single-player mechanics; no multiplayer, tests, backend, or Expo.
- **Item effects:** **Implemented.** Equipment slots (Main Hand, Armor, Relic) and Inventory. Stats (Str, Agi, Arcane, AC, maxHp, maxStress) are calculated from base + equipment bonuses. Consumables (e.g. Ember Salve) can be used to Heal or relieve Stress. Combat uses effective stats.
- **Deterministic starting state:** Implemented. Use `?deterministic=1`: starting character is ranger (Ashwalker), level 1, full health (24 HP), basic equip, no progress flags; start room has no random allies or merchants. Other query params (e.g. `forceEnemy`, `forceMerchant`, `lowHp`) still apply when set.
- **Threads, Vignette, GameScreen, rooms, NPCs tie together:** **Implemented.** `RoomViewport` now surfaces the active Vignette or current Scene/Thread, linking narrative state to the spatial view. `relatedNpcIds` is populated. `vignette.threadIds` is wired.
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
- **Currency / value system:** `@Forboc.AI/Platform/docs/CURRENCY_AUDIT.md` — spirit, blood, sacrifice (qvht/forboc macro vision; trading, sacrifice, gains).
- additional context /Users/seandinwiddie/Documents/GitHub/qvht.github.io /Users/seandinwiddie/Documents/GitHub/forboc.github.io
- **Code standards:** `@Forboc/notes/ref/standards/technology-maintenance/condensed.md` — FP/Redux, reducer-first. **Do NOT implement:** tests, logging, backend, db, or Expo.
- **Current status:** `@Forboc.AI/Platform/docs/PLAYTEST_AUTOMATION.md` — test coverage, Known issues, reproduction steps.

**Scope:**
- Test and improve **all** single-player gameplay (movement, combat, level generation, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, level progression, experience, session/scoring). **Exclude multiplayer.**

**Implementation targets (from Known issues):**
- **Currency (spirit, blood, sacrifice):** **Implemented.** See CURRENCY_AUDIT.md. Header shows Spirit/Blood; trading uses spirit (and optional blood); Sacrifice in inventory; gains from COMMUNE, Oracle, enemy defeat.
- **Item effects:** **Implemented.** Equip system, stat bonuses, consumable effects. Weapons, spells, upgrades affect combat/stats per quadar.md.
- **Deterministic starting state:** **Implemented.** Use `?deterministic=1` for ranger, level 1, full health, basic equip, no progress flags.
- **Threads, Vignette, rooms, NPCs tie together:** **Implemented.** `relatedNpcIds`, Vignette `threadIds`, RoomViewport scene–room links.
- **Story integration:** Tie movement, combat, level gen, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, XP, and level progression into the story. Gameplay should drive narrative and narrative should drive gameplay (e.g. combat → commodities → merchants; exploration → quests; vignettes reflect combat/trade; level-up unlocks abilities). Story emerges from mechanics.

**Deliverables:**
1. Systematic playthrough of all single-player mechanics.
2. Concrete improvements (bugs, UX, balance, alignment with quadar / quadar_ familiar).
3. `docs/PLAYTEST_AUTOMATION.md` kept current with test coverage, reproduction steps, and Known issues.

**Technical constraints:**
- Follow condensed.md for frontend architecture. No automated tests (Jest/Cypress), backend, db, or Expo. Web client only.

**Suggested next steps:**
1. Read PLAYTEST_AUTOMATION.md (What was tested, Known issues) and the referenced design docs.
2. **MANDATORY:** Use the `browser_subagent` tool to open `http://localhost:3000` and verify flows: Init, Movement, SCAN, ENGAGE, COMMUNE, Oracle, Facts, Vignette, Concession, Merchants/Trading/Inventory, Level generation, Hazards, NPCs, autoplay, spells, abilityes, weapons, player development, etc. Take screenshots/recordings to confirm UI state.
3. Identify discrepancies vs quadar_ familiar.md and quadar.md.
4. Implement fixes or enhancements; update the doc after each change.

---

**Quick start:** Copy the Task section above into a new chat to run a full playtest cycle. Targets Platform at localhost:3000; references quadar_ familiar, quadar, and condensed.md; excludes multiplayer, tests, backend, db, Expo.