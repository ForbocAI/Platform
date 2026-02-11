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

| Param | Effect |
|-------|--------|
| `?simulateInitError=1` | Forces init to fail so the Loading overlay shows and **Retry** (`loading-retry`) can be tested. |
| `?forceEnemy=1` | Adds one random enemy to the starting room so **Combat** and **Concession** flows can be tested without relying on random room generation. |
| `?lowHp=1` | Sets player HP to 5 at init. Use with `forceEnemy=1` so an enemy hit that would take you out triggers the **Concession** modal (RNG: enemy must land a hit; may need several ENGAGEs). |
| `?forceMerchant=1` | Adds one merchant to the starting room so **Trading** can be tested (60% chance by default). |
| `?deterministic=1` | **Deterministic starting state:** Ranger (Ashwalker), level 12, full health (120 HP), basic equip, no progress flags; start room has no random allies or merchants. Use for reliable playtest automation. |

## Layout (for snapshot / scrolling)

The **Stage selector**, **Fade out scene** button, and **Oracle form** (Ask Oracle input + Send) live in a fixed footer strip below the scrollable middle column (Threads, Facts, Vignette, Neural Log). They are always visible without scrolling, so automation can target them by `data-testid` or `aria-label` without scrolling the log into view first. **When Fade out appears:** Clicking "Start vignette" (with at least one thread and current room) dispatches `fadeInScene`, so the Fade out button appears after starting a vignette. A default "Reconnaissance" thread is seeded on first load so vignette + Fade out work without manual thread creation.

## Auto-play

The header **auto-play** button (`auto-play-toggle`, aria-label "Start auto-play" / "Stop auto-play") toggles a mode where the game runs on its own:

-   It simulates a "Relentless Chronicler" who fights (using spells/attacks), heals (using items), equips gear, scans, trades (buy/sell), and communes.
-   Auto-play runs via Redux listener middleware (no component `useEffect`).

Use auto-play for soak testing or to quickly generate log/facts state for manual checks.

---

## Test coverage (single-player)

**Last playtest:** 2026-02-09. App: Forboc.AI/Platform at `http://localhost:3000`.

**Re-verification (2026-02-09):** Init (Retry → Connection Stable), header (Spirit 20, Blood 0, HP 120/120, LVL 12 Ashwalker), Quests (Scan 5, Find Fellow Ranger, Defeat 3 hostiles, Trade 2 merchants), SCAN (Neural Log [SCAN RESULT] with Location, Biome, Hazards, Hostiles, Allies, Exits; [Keen Senses]; quest 1/5). **Deterministic param fix:** `getInitOptions` now reads from `window.location.search` when available so `?deterministic=1` applies on first load (avoids useSearchParams hydration timing). Use `?deterministic=1` for Store Room, no merchants.

**Re-verification (browser automation):** With `?deterministic=1`, flows re-verified 2026-02-09: Init (Level 12 Ashwalker; click Retry if "INITIALIZING..." persists; then Store Room, Reconnaissance, "Connection Stable"); Movement (N/S/E/W); Map (Explored map; map button toggles); SCAN, ENGAGE, COMMUNE, Oracle, Facts panel, Stage selector, Vignette; Inventory/Spells panels; header shows Spirit/Blood. Auto-play driven by Redux listener (`runAutoplayTick` every ~2.8s when toggled on). **Surge Count:** Verified via Oracle logs (e.g. "Surge: 2"). **Force Merchant:** Verified via `?forceMerchant=1` (spawns merchant if none present). **Query params (2026-02-09):** `?deterministic=1`, `?forceEnemy=1`, and `?lowHp=1` are now wired from URL into init: GameScreen reads searchParams and passes them to `initializeGame`; engine `generateStartRoom({ deterministic, forceMerchant, forceEnemy })` and player `lowHp` are applied.

**Browser playtest (2026-02-09):** Loaded `http://localhost:3000/?deterministic=1`. **Fixes applied during playtest:** (1) `mechanics.ts` — quoted key `"Obsidian Warden"` in `LEVEL_SPELL_UNLOCKS` (parse error). (2) `Runes.tsx` — replaced Redux `selectClientHydrated` with local `useClientMounted()` (useState + useEffect) to avoid hydration mismatch (server vs client rune text). (3) `GameScreenMain.tsx` — added `activeQuests`, `sessionScore`, `sessionComplete` to destructured props (ReferenceError). **Verified in browser:** Init (click Retry when "INITIALIZING..." persists → "Connection Stable"); header (ASHWALKER, Kamenal LVL 12, HP 120/120, Spirit 20, Blood 0); Stage (Knowledge/Conflict/Endings); Quests panel ("Scan 5 sectors: 0/5", "Find a Fellow Ranger: 0/1"); SCAN → Neural Log shows [SCAN RESULT] (Location, Biome, Hazards, Hostiles, Allies, Exits) and recon advances to 1/5; Facts (1); Vignette (theme, Start); Oracle input; movement (N/W/E/S), SCAN, ENGAGE, COMMUNE; View spells, View items. Element refs go stale after actions — take fresh snapshot before each interaction for full automation.

**Improvements this pass (2026-02-09):** **Game Logic Implementation:** Replaced stub logs with real Redux thunks for `scanSector` (returns room details/hazards/exits), `engageHostiles` (resolves combat rounds, updates HP, handles death/victory), `communeWithVoid` (calls Loom), and `respawnPlayer` (resets state). **Story Integration:** Connected Game actions to Narrative state—Oracle, Commune, Scan, and Combat events now automatically generate Facts. **Concession:** Implemented `ConcessionModal` (triggered at 0 HP) with Reject (Respawn) flow. **Init/Currency:** `initializePlayer()` in engine now sets `spirit: 20`, `blood: 0`. **Trading System:** Fully implemented `tradeBuy`/`tradeSell` mechanics with UI (TradePanel). Added `?forceMerchant=1` for testing. **Vignette Controls:** Enhanced with pre-filled, read-only theme input and randomization logic. **Auto-play:** Store listener now dispatches `runAutoplayTick`. **Condensed compliance:** Runes use `selectClientHydrated`; NeuralLogPanel uses CSS sentinel. **Spell Casting:** Implemented `castSpell` thunk and connected UI; casting a spell now uses specific spell logic/effects instead of generic attack. **Narrative/Surge:** Implemented 'Surge Count' tracking and 'Unexpectedly' effects (Entering the Red, Enter Stage Left) to spawn dynamic entities.

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
| **Vignette** | Automated on Init. Verify "Acting: [Theme] · Exposition" in UI. | ✅ **Automated:** Vignette starts automatically on game init. Advances via combat/trade events. Theme chosen randomly by engine. Manual controls removed. |
| **Fade out scene** | With a current scene, click "Fade out" in footer | ✅ (Scene id present when room + thread established) |
| **Loading / Retry** | Load `?simulateInitError=1` | ✅ "Simulated init failure." + "Retry initialization" (aria-label); Retry re-runs init (fails again while param set) |
| **Concession** | `?lowHp=1&forceEnemy=1`, ENGAGE until enemy hit would take player out | ✅ **Death implemented:** Rejecting concession at 0 HP logs death, clears room enemies, and respawns player (full HP). |
| **Level generation** | Move to new rooms (N/S/E/W); SCAN in each | ✅ Biomes: Quadar Tower (start), Ethereal Marshlands, Toxic Wastes, Haunted Chapel, Obsidian Spire. Room titles vary by biome (e.g. Acid Pit, Ghost Swamp). ~30% chance of one hostile per room; exits random. |
| **Hazards** | SCAN in rooms; or COMMUNE until Loom returns "unexpectedly" + **Entering the Red** | ✅ **Fully Implemented:** Toxic Air (generation); **Entering the Red** spawns Random Enemy and adds "Threat Imminent" hazard. |
| **NPCs (Fellow Ranger)** | Start room has 40% chance; or COMMUNE until "unexpectedly" + **Enter Stage Left** | ✅ **Start:** `generateStartRoom()` adds Fellow Ranger 40% of the time. **Enter Stage Left:** Confirmed spawns a Merchant and Fellow Ranger ally. |
| **Merchants / Trading** | Load with `?forceMerchant=1` or find merchant; click "Trade" | ✅ **Verified 2026-02-09:** TradePanel opens/closes. Buying deducts Spirit (e.g. 20 -> 15). Selling adds Spirit (e.g. 15 -> 20). Logs confirm "Purchased..." and "Sold...". Wares list shows correct costs. |
| **Inventory / Items** | Click "Inventory". Equip/Unequip/Use/Sacrifice items. | ✅ Stats update. Consumables heal/reduce stress. **Sacrifice:** Items with value show "Sacrifice"; removes item, grants spirit (log "Sacrificed X for Y spirit."). |
| **Currency (Spirit / Blood)** | Check header after init; COMMUNE or Ask Oracle (+1 spirit each); defeat enemy (+5 spirit, +2 blood); Trade or Sacrifice | ✅ Header shows Spirit, Blood. Start 20 spirit, 0 blood. Gains as above. |
| **Spell Casting** | In combat, click Spell icon in Action Deck | ✅ **Implemented:** Clicking spell triggers `castSpell`. Validated via logs ("You cast..."). *Note: Initial bug with `onCast` prop fixed.* |
| **Level Progression / XP** | Defeat enemies to gain XP; Level Up at threshold | ✅ **Verified 2026-02-09:** Defeating enemy grants 50 XP (log "Gained 50 XP"). Bar updates. **Level Up:** Verified scaling (XP resets, Level++, MaxXP += 100, MaxHP += 10). **Level-up spell unlock:** At certain levels (e.g. Ashwalker 13–16) a new spell is unlocked and logged (e.g. "Unlocked: Smoldering Arsenal"). |
| **Quests** | Init seeds four quests: "Scan 5 sectors", "Find a Fellow Ranger", "Defeat 3 hostiles", "Trade with 2 merchants". SCAN/move/combat/trade update progress. | ✅ **Implemented:** Quests panel (`quests-panel`) shows progress (e.g. "Scan 5 sectors: 2/5"). Completion adds log + Fact. Room exploration, SCAN, combat, and trade update progress. |
| **Session completion / Scoring** | Complete all quests → session complete; score shows rooms explored, scans, foes defeated, quests completed, spirit earned. | ✅ **Implemented:** When all active quests are complete, `sessionComplete` is set; Quests panel shows "Session complete — Rooms: N | Scans: N | Foes: N | Quests: N | Spirit: N". |
| **Companion Combat** | Load `?deterministic=1&forceMerchant=1&forceEnemy=1` (spawns Captain & Enemy). Trade -> Buy Contract -> Inventory -> Sign. Click "Engage enemy". | ✅ Companion participates in combat. Log shows "CompanionName attacks Enemy...". Enemy retaliates against Player OR Companion. |
| **Servitor Management** | With a servitor hired (Servitors indicator visible in header), click "Servitors". | ✅ **Implemented:** Servitors panel opens showing servitor name, role, HP bar, and stats. |

### Reproduction steps (cursor-ide-browser)

1. **Stale refs:** Snapshot → find ref → single action (click/type) → snapshot again before next action.
2. **Facts:** Ask Oracle or COMMUNE first so facts exist; then target "Open Facts" (or "Close Facts" when open).
3. **Concession:** Navigate to `http://localhost:3000/?lowHp=1&forceEnemy=1`, then repeatedly click "Engage enemy" until either the Concession modal appears (enemy lands a killing hit) or the enemy is defeated.
4. **Hazard "Threat Imminent":** Be in any room, click "Commune with void" repeatedly until the Oracle returns an answer with "[EVENT: Entering the Red]". SCAN or check room view to see "Threat Imminent" in hazards (or an enemy may be added instead, 50% each).
5. **Fellow Ranger (Enter Stage Left):** Be in a room without a Fellow Ranger, click "Commune with void" until the Oracle returns "[EVENT: Enter Stage Left]". RoomViewport and SCAN will show "Fellow Ranger".
6. **Inventory close:** When the Inventory panel is open, target the X button by aria-label "Close Inventory" (or `data-testid="inventory-close"`); the overlay can intercept clicks on the deck toggle, so use the panel's close button for automation.
7. **Currency / Trade:** Header shows Spirit and Blood. TradePanel shows current Spirit/Blood and per-ware cost (e.g. "5 spirit" or "5 spirit, 3 blood"). Buy is disabled when cost exceeds available spirit or blood. Use `trade-buy-{itemId}` only when player can afford.
8. **Sacrifice:** Open Inventory; items with value show a "Sacrifice" button (`inventory-sacrifice-{itemId}`). Click to remove item and gain spirit; log shows "Sacrificed X for Y spirit."
9. **Quests:** After init, sidebar shows Quests panel (`data-testid="quests-panel"`) with "Scan 5 sectors: 0/5" and "Find a Fellow Ranger: 0/1". SCAN in 5 different rooms (or same room 5 times) completes recon; move into a room with a Fellow Ranger (e.g. after Enter Stage Left) completes rescue. When both complete, "Session complete" and score line appear.

### Known issues / notes

- **Auto-play:** Driven by Redux listener on `toggleAutoPlay`; dispatches `runAutoplayTick` every ~2.8s. Valid actions (move, SCAN, ENGAGE, COMMUNE, Oracle) and concession handling in thunk. Doc table and layout unchanged.
- **Init race:** On first load, "INITIALIZING..." may show until user clicks Retry; bootstrap runs in microtask and init thunk can complete after first paint. Click Retry to force init if needed. **Deterministic param:** `getInitOptions` now reads from `window.location.search` when available so `?deterministic=1` applies reliably on first load (fixes useSearchParams hydration timing).
- **SCAN allies:** As of this pass, SCAN readout includes "Allies: …" (e.g. Fellow Ranger or "None") so reconnaissance discovers non-hostile NPCs (Familiar alignment).
- **Merchants / Trading implemented:** Nomadic traders (Gloamstrider, Twilightrider, Emberogue) spawn in Store Room (60%) and randomly in rooms (15%). Enter Stage Left can add a merchant. Click "Trade" on merchant → TradePanel (Verified 2026-02-09): shows player Spirit/Blood; wares show spirit cost and optional blood cost; Buy disabled when insufficient; buy deducts spirit (and blood); sell adds spirit. Log entries for trades. SCAN reports Merchants.
- **Currency (spirit, blood, sacrifice):** See `docs/CURRENCY_AUDIT.md`. No gold/coins; primary currency is **spirit**, with **blood** for ritual-tier wares. Header displays Spirit and Blood. Spirit gains: +1 COMMUNE, +1 Oracle answer, +5 spirit +2 blood on enemy defeat. Sacrifice: from Inventory, items with value can be sacrificed for spirit (button `inventory-sacrifice-{itemId}`).
- [x] **story_integration_verify**:
  - **Goal**: Confirm Trade and Combat actions generate "Facts".
  - **Steps**:
    1. Enter game.
    2. Trade with merchant (buy/sell).
    3. Defeat an enemy.
    4. Check "Narrative Log" for "Purchased...", "Sold...", "Heroically defeated..." facts. (Note: "Combat Resolution" fact was added in recent update).
    5. **XP / Level:** Verify "Gained 50 XP" log on defeat. Verify XP bar update.
    6. Verify `ActionDeck` shows "Inventory" button (or panel toggle).

- [x] **spell_combat_verify**:
  - **Goal**: Confirm Spells can be cast and have effects.
  - **Steps**:
    1. Enter game.
    2. Move/Scan until an Enemy is present.
    3. Locate "Known Spells" in Action Deck.
    4. Click a Spell (e.g. "Relic Strike" or "Ignition Burst").
    5. Verify Log output: "You cast [SpellName]...".
    6. Verify Enemy HP decreases (via Scan or Log).
  - **Status**: **Fully Implemented.** UI supports spell selection, which overrides basic attack in `engageHostiles`. Logs confirm specific spell usage.

See `trade-panel`, `trade-merchant-*`, `trade-buy-*`, `trade-sell-*`.
-   **Quests & Session (implemented):** Init seeds **Reconnaissance** (Scan 5 sectors), **Rescue** (Find a Fellow Ranger), **Defeat 3 hostiles), and **Trade with 2 merchants**. SCAN/move/combat/trade update progress; when all complete, session ends with score. **Session end on death:** Respawn sets `sessionComplete = "death"` and `sessionScore.endTime`; Quests panel shows "Session ended (death)" with same stats. **Level-up:** `LEVEL_SPELL_UNLOCKS` grants spells by class; `LEVEL_SKILL_UNLOCKS` grants skills (e.g. Ashwalker 12: keen_senses). **Skills seeded at init** via `getSkillsForLevels`; **skill effects:** keen_senses adds "[Keen Senses] …" to SCAN, stone_skin reduces incoming damage by 2, battle_fervor adds +2 damage dealt; more skills per class (Ashwalker 14/16, Obsidian Warden 15/17, Doomguard 15/17, Iron Armored Guardian, Aether Spirit). **Not in scope:** Multiplayer, automated tests, backend, db, Expo.
-   **Item effects:** **Implemented.** Equipment slots (Main Hand, Armor, Relic) and Inventory. Stats (Str, Agi, Arcane, AC, maxHp, maxStress) are calculated from base + equipment bonuses. Consumables (e.g. Ember Salve) can be used to Heal or relieve Stress. Combat uses effective stats.
-   **Deterministic starting state:** Implemented. Use `?deterministic=1`: starting character is ranger (Ashwalker), level 12, full health (120 HP), basic equip, no progress flags; start room is fixed "Store Room" with no random allies or merchants. **Query params wired:** `deterministic`, `forceEnemy`, `forceMerchant`, `lowHp` from URL. **Init race:** GameScreen shows LoadingOverlay whenever `!isInitialized` (not only when `isLoading`), so the "INITIALIZING…" screen is always the overlay until init completes; Retry passes same URL options via `getInitOptions()`.
-   **Threads, Vignette, GameScreen, rooms, NPCs tie together:** **Implemented.** `RoomViewport` surfaces the active Vignette or current Scene/Thread; `relatedNpcIds`, `vignette.threadIds` wired. **Fade-out scene:** VignetteControls has a "Fade out" button (`data-testid="fade-out-scene"`) when `currentSceneId` is set; it dispatches `fadeOutScene({ sceneId })` from the narrative slice.
-   **Story integration (implemented):** Vignette stage advances when an enemy is defeated (engageHostiles/castSpell) and when a trade completes (tradeBuy/tradeSell), so vignettes/threads react to combat and trade. Movement, combat, level generation, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, level progression, and experience tie together; story emerges from and drives these mechanics.

**Base Camp:** Init verified. "Recon Base Camp" safe zone (no enemies). Hydroponics plot grows 20%/tick. Harvest button appears at 100%. "Harvest" grants "Glowing Mushroom" (consumable). Autoplay automatically harvests when ready and uses mushroom when HP < 40%. **Auto-Crafting:** implemented for base camp; bot crafts potions if ingredients available.
**Accelerated Autoplay:** Verified loop speed starts at 800ms and accelerates by 5% per tick down to 200ms. Bot behavior is significantly faster and smoother. Smart logic handles exploration (unvisited rooms priority), combat (spell usage), and economy (buy/sell).
**Known Issue:** Death/Respawn modal interrupts autoplay; requires manual click "Reject (Die and Respawn)" to continue. Survival logic enhanced to flee if HP < 20% and enemies present.
**Visual Feedback:** Combat animations verified. Enemy flashes on attack (`animate-enemy-attack`) and double-flashes on taking damage (`animate-enemy-damage`).
**Combat Logic:** Enemy spellcasting verified. Enemies now use their specific class spells (e.g. Storm Titan casts Electrical Charge/Thunderous Slam) alongside basic attacks, with correct damage and effect logs.
**Browser playtest (continued):** With `?deterministic=1&forceEnemy=1&lowHp=1`: Start vignette (e.g. "The Machine God" · Exposition), open Trade with merchant, complete a purchase → log "Purchased [item] from [merchant]"; vignette advances to "Rising Action" (button becomes "Advance to Climax"); Quests panel shows "Trade with 2 merchants: 1/2". Init, four quests, SCAN progress (1/5), trade panel, combat (ENGAGE) and vignette Start/Advance/End all verified. Session end on death and vignette advance on enemy defeat appear after respawn or kill in play.

**Browser playtest (2026-02-10 - Comprehensive):** Systematic single-player playthrough via automation. **Verified:** Deterministic Init (Ashwalker Lvl 12, 120 HP); Movement/Scanning (Biomes: Ethereal Marshlands, Military Installation, etc.); Quests (Scan 5 sectors completed); Trading (Sold Relic Shard, Spirit +5; Bought items); **Sacrifice:** Verified items with value (e.g. Rogue's Blade) show Sacrifice button. Clicking it removes item and grants Spirit (value/2). Log confirms action. **Marketplace Logic:** Engine now supports "Bustling Marketplace" rooms in "Market" areas (Quadar Tower) spawning 2-4 merchants. **Surge Logic Check:** Verified `engine.ts` implements Surge Count correctly per design doc (Add 2 for Yes/No, Reset for qualifiers).

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
- **Code standards:** `@Forboc/notes/ref/standards/technology-maintenance/condensed.md` — FP/Redux, reducer-first. **Do NOT implement:** tests, backend, db, or Expo.
- **Current status:** `@Forboc.AI/Platform/docs/PLAYTEST_AUTOMATION.md` — test coverage, Known issues, reproduction steps.

**Scope:**
- Test and improve **all** single-player gameplay (movement, combat, level generation, hazards, NPCs, wares, quests, skills, spells, upgrades, weapons, inventory, level progression, experience, session/scoring). **Exclude multiplayer.**

**Implementation targets (from Known issues):**
- **Currency (spirit, blood, sacrifice):** **Implemented.** See CURRENCY_AUDIT.md. Header shows Spirit/Blood; trading uses spirit (and optional blood); Sacrifice in inventory; gains from COMMUNE, Oracle, enemy defeat.
- **Item effects:** **Implemented.** Equip system, stat bonuses, consumable effects. Weapons, spells, upgrades affect combat/stats per quadar.md.
- **Deterministic starting state:** **Implemented.** Use `?deterministic=1` for ranger, level 12, full health, basic equip, no progress flags.
- **Threads, Vignette, rooms, NPCs tie together:** **Implemented.** `relatedNpcIds`, Vignette `threadIds`, RoomViewport scene–room links.
- **Story integration:** Verified. Combat yields XP and commodities. Level-up increases power (MaxHP). Trading implemented. Mechanics now feed into progression loop.

**Deliverables:**
1. Systematic playthrough of all single-player mechanics.
2. Concrete improvements (bugs, UX, balance, alignment with quadar / quadar_ familiar / forboc / qvht ).
3. `docs/PLAYTEST_AUTOMATION.md` kept current with test coverage, reproduction steps, and Known issues.

**Technical constraints:**
- Follow condensed.md for frontend architecture. No automated tests (Jest/Cypress), backend, db, or Expo. Web client only.

**Suggested next steps:**
0. Have all file names, folder names, function names, variable names, etc to be lore agnostic.
0.5. Make sure the folder/file/function/engineering architecture represents a clear Entity-Component System. reference @Forboc/client/src
0.75. Refactor files into subdomains prioritiezed by line count.
0.8 Add vendor marketplace areas where there are lots of merchants to trade with selling different types of wares and servants/servitors for hire.
1. Read PLAYTEST_AUTOMATION.md (What was tested, Known issues) and the referenced design docs.
2. **MANDATORY:** Use the browser tools (e.g. cursor-ide-browser) to open `http://localhost:3000` and verify flows: Init, Movement, SCAN, ENGAGE, COMMUNE, Oracle, Facts, Vignette, Concession, Merchants/Trading/Inventory, Level generation, Hazards, NPCs, autoplay, spells, abilities, weapons, player development, etc. Take a fresh snapshot before each interaction (refs go stale after actions). Take screenshots to confirm UI state.
3. Identify discrepancies vs quadar_ familiar.md and quadar.md.
4. Implement fixes or enhancements; update the doc after each change.

---

**Quick start:** Copy the Task section above into a new chat to run a full playtest cycle. Targets Platform at localhost:3000; references quadar_ familiar, quadar, and condensed.md; excludes multiplayer, tests, backend, db, Expo.