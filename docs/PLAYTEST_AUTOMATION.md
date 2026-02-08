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
| Stage (Knowledge / Conflict / Endings) | `stage-to-knowledge`, `stage-to-conflict`, `stage-to-endings` |
| Fade out scene | `fade-out-scene` |
| Facts toggle / panel | `facts-toggle`, `facts-panel` |
| Thread buttons | `thread-{threadId}` |
| Vignette theme / Start / Advance / End | `vignette-theme`, `vignette-start`, `vignette-advance-*`, `vignette-end` |
| Concession modal / Accept (flee, etc.) / Reject | `concession-modal`, `concession-accept-flee`, …, `concession-reject` |
| Volume / Music | `volume-up`, `volume-down`, `music-toggle` |
| Player header | `player-header` |
| Stage selector | `stage-selector` |
| Thread list | `thread-list` |
| Vignette controls | `vignette-controls` |
| Loading overlay Retry | `loading-retry` |

## Layout (for snapshot / scrolling)

The **Stage selector**, **Fade out scene** button, and **Oracle form** (Ask Oracle input + Send) live in a fixed footer strip below the scrollable middle column (Threads, Facts, Vignette, Neural Log). They are always visible without scrolling, so automation can target them by `data-testid` or `aria-label` without scrolling the log into view first.

## Auto-play

The header **auto-play** button (Play / Square icon) toggles a mode where the game runs on its own:

- Every ~2.8 s it performs one random valid action: move (if an exit exists), SCAN, ENGAGE (if hostiles present), COMMUNE, or Ask Oracle (random question).
- If a concession is offered, it randomly Accept or Reject.

Use auto-play for soak testing or to quickly generate log/facts state for manual checks.
