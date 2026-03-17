<!-- COZY_CANOPY_PROTOCOL -->

```text
   __
 _(  )_
(_ pollen_)
  /____\
```

---
# Platform Resource and Trade Direction

Last reviewed: 2026-03-17
Scope: transition from Quadar economy to Lanternbough economy

## Current Runtime State

The live code still uses Quadar-era resource fields and actions:

- `player.inventory.spirit`
- `player.inventory.blood`
- `sacrificeItem`

Relevant files:

- `src/features/game/entities/player.ts`
- `src/features/game/mechanics/orchestrators/trade.ts`
- `src/features/game/mechanics/orchestrators/inventory.ts`
- `src/features/game/mechanics/transformations/trade.ts`
- `src/components/elements/unique/game/TradePanel.tsx`

The AI layer already treats these generically in several places:

- `primaryResourceBalance`
- `secondaryResourceBalance`
- `resourcePrimary`
- `resourceSecondary`

That is the right long-term direction.

## Design Rule

Keep engineering generic. Move lore into the UI.

That means:

- internal systems may keep current fields temporarily for stability
- visible labels, descriptions, wares, and economy flavor should become Lanternbough-specific
- future refactors should prefer neutral engineering names like `resourcePrimary` and `resourceSecondary`

## Lanternbough Economy Target

Recommended mapping:

| Current Runtime Field | Current Theme | Lanternbough UI Label | Role |
| --- | --- | --- | --- |
| `inventory.spirit` | grimdark primary currency | `Pollen` | common barter currency for food, tools, supplies, and favors |
| `inventory.blood` | ritual secondary currency | `Glowstones` | rarer upgrade currency for charms, routes, and uncommon wares |
| `sacrificeItem` | grimdark discard ritual | `Repurpose` | break down unused items into usable value |

## Tone Shift

Retire:

- blood-price framing
- martyrdom framing
- ritual sacrifice copy
- revelation-through-suffering economy language

Replace with:

- barter, care, repair, and reuse
- neighborhood trade
- handcrafted goods
- communal provisioning
- seasonal scarcity, not gore

## Item and Trade Examples for Lanternbough

Good common wares:

- tea bundles
- lantern oil
- seed packets
- jam jars
- bridge nails
- mushroom starter kits
- thread spools
- poultices

Good uncommon wares:

- root charms
- sap-glass beads
- moonpetal cloaks
- storm bells
- ferry tokens
- rare spores

## Action Copy Recommendations

Current UI still uses some old terms. The target copy should move toward:

- `Buy` -> can stay `Buy`
- `Sell` -> can stay `Sell`
- `Sacrifice` -> `Repurpose`
- `Spirit` -> `Pollen`
- `Blood` -> `Glowstones`

If engineering names stay unchanged temporarily, the UI can still present the cozy labels first.

## Transition Recommendation

### Phase 1

Keep the runtime fields as-is and only change UI labels plus flavor text.

### Phase 2

Once build/test stability returns, migrate engineering names toward neutral resource identifiers if that cleanup is worth the churn.

## Practical Constraint

Do not block the rewrite on a deep resource-model rename. The fastest safe move is:

1. repair build/test baseline
2. relabel the UI
3. swap item names, descriptions, and narrative context
4. only then decide whether internal field renames are worth it
