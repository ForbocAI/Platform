<!-- COZY_CANOPY_PROTOCOL -->

```text
   .-.
  /___\
  |o o|
  |_^_|
 /|   |\
```

---
# Platform Component Structure

Last verified: 2026-03-17

## Layering Rule

The UI should stay compositional:

- screens compose unique and generic components
- unique components compose generic components where possible
- generic components stay domain-neutral

## Current Folder Layout

### `src/components/elements/generic/`

Reusable primitives with no game-specific story knowledge.

Current examples:

- `GameButton.tsx`
- `NavButton.tsx`
- `Modal.tsx`
- `LoadingOverlay.tsx`
- `StatBox.tsx`

### `src/components/elements/shared/`

Small cross-domain UI helpers that are still presentation-first.

Current example:

- `TypewriterText.tsx`

### `src/components/elements/unique/`

Domain-specific UI grouped by subdomain.

Current subfolders:

- `game/`
  - `ActionDeck/`
  - `PlayerHeader/`
  - `AreaViewport.tsx`
  - `TradePanel.tsx`
  - `InventoryPanel.tsx`
  - `CraftingPanel.tsx`
  - `CompanionPanel.tsx`
  - `ConcessionModal.tsx`
  - `MapView.tsx`
  - `NeuralLogPanel.tsx`
  - `QuestsPanel.tsx`
  - `SkillsPanel.tsx`
- `narrative/`
  - `FactsPanel.tsx`
  - `InquiryForm.tsx`
  - `StageSelector.tsx`
  - `ThreadList.tsx`
  - `VignetteControls.tsx`
- `shared/`
  - `Runes.tsx`
  - `VolumeControls.tsx`

### `src/components/screens/`

Page-level assemblies.

Current examples:

- `ClassSelectionScreen.tsx`
- `GameScreen/`
  - `GameScreenHeader.tsx`
  - `GameScreenMain.tsx`
  - `GameScreenFooter.tsx`
  - `GameScreenOverlays.tsx`

## Composition Guidance

### Screens

Screens should:

- orchestrate layout and dispatch handlers
- avoid owning low-level visual controls directly
- pull specialized UI from `elements/unique`

### Unique Components

Unique components should:

- own domain presentation
- stay reusable within the game
- prefer `GameButton`, `NavButton`, `Modal`, and `StatBox` instead of reimplementing common controls

### Generic Components

Generic components should:

- not import game lore tables
- avoid depending on class names, faction names, or biome names
- accept props that can be reused across multiple themes

## Naming Rule for the Rewrite

Keep engineering names neutral.

Good:

- `InquiryForm`
- `PlayerHeader`
- `TradePanel`
- `CompanionPanel`
- `AreaViewport`

Avoid introducing new names like:

- `DryadBlessingPanel`
- `GnomeBridgeButton`
- `LanternboughQuestBox`

Those specifics should live in copy and data, not the component API.

## Current UI Debt

- some visible labels and content still carry legacy/old-aesthetic language
- `Runes.tsx` and some related styling choices still encode the old aesthetic
- the screen structure is solid, but the content pipeline is not yet Lanternbough-native

## Immediate UI Focus

1. Replace app-level branding and metadata.
2. Replace class and lore copy visible in the screen flow.
3. Keep component boundaries intact while swapping presentation and content.
