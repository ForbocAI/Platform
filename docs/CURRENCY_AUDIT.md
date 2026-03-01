<!-- AESTHETIC_PROTOCOL_COMPLIANCE -->

<!-- ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ -->

```text
    [VOID::WATCHER]

```

SYSTEM_OVERRIDE // NEURAL_LINK_ESTABLISHED // LOG_ERR_CRITICAL



---
# Currency & Trading: Macro Vision Audit

## Sources

- **qvht.github.io** — Qvht index, Echoes of the Abyssal Maw, style-guide
- **forboc.github.io** — Forboc articles (The Descent, Echoes of the Enigmatic Realm), style-guide
- **Platform** — Forboc.AI/Platform game (Qua'dar); trading and player state

---

## 1. qvht.github.io — Macro Vision

### Spirit as currency

- **index.html**: *"Our ego, that is our sense of self is a shadow of what we spend spirit on. **Currency becomes.** Setting intentions and catalyzing them through meditation produces desired results aka magik."*
- **Interpretation**: Spirit is the medium of exchange. What you **spend spirit on** defines identity; that spending *is* the currency. No coins: spirit is gained (intention, meditation, magik) and spent (on outcomes, identity, results).
- **index.html**: *"Everything is spirit. The singular is composed of the multitude indefinitely."*

### Blood

- **echoes-of-the-abyssal-maw.html**:
  - *"A price paid in **blood and sacrifice**."*
  - *"stone altar stained with ancient blood"*, *"blood-stained table"*, *"precision and gore"*
  - Tags: **#MartyrsBlood**, **#RitualSacrifice**
  - Martyrs "faced their persecutors with unwavering resolve" — blood as cost of faith/endurance.
- **Interpretation**: Blood is the **price** for revelation, rites, and forbidden knowledge. Literal and metaphorical: spilled blood, martyrs’ blood, ritual cost.

### Sacrifice

- **echoes-of-the-abyssal-maw.html**:
  - *"They come at a price. A price paid in blood and **sacrifice**."*
  - *"the pursuit of knowledge is worth any **sacrifice**"*
  - *"It requires **sacrifice**, courage, and a willingness to embrace the darkness within."*
  - *"What trials and **sacrifices** must I endure to attain this forbidden knowledge?"*
- **Interpretation**: Sacrifice is what you **give up** to gain knowledge, power, or passage. Ritual and moral cost; often paired with blood.

### Summary (qvht)

| Concept    | Role in economy / narrative |
|-----------|------------------------------|
| **Spirit** | Primary currency. Spend spirit → identity/outcomes. Gained via intention, meditation, magik. |
| **Blood**  | Price of revelation and ritual. "Price paid in blood." Martyrs’ blood; literal and symbolic cost. |
| **Sacrifice** | Giving something up for gain. Paired with blood; "courage, sacrifice, willingness to embrace darkness." |

---

## 2. forboc.github.io — Alignment

- **Style**: Same grimdark cyberpunk noir (style-guide); "manifestation of the void"; runes, sci-fi logs, Lovecraft/Gibson/Frater Acher.
- **Spirit**: Tagline "We find our **spirit** amidst eerie foliage." Spirit as locus of journey/revelation.
- **Themes**: Chthonic descent, abyssal realms, revelation at a cost, guardians and thresholds — consistent with qvht’s "price paid in blood and sacrifice" and spirit as currency.
- **Conclusion**: forboc does not define a separate economy; it shares the **spirit / blood / sacrifice** cosmology. Platform should align with qvht’s explicit currency formulation.

---

## 3. Platform (Qua'dar) — Current vs Macro Vision

### Before this implementation

- **Trading**: Pure item swap. Buy: move item from merchant to player. Sell: move item from player to merchant. No currency check.
- **Player**: No `spirit`, no `blood`. `surgeCount` exists for Loom/Oracle.
- **Item**: Optional `value` (numeric) commented "Trade value"; unused in buy/sell logic.

### Alignment with macro vision

| Macro (qvht/forboc) | Platform implementation |
|---------------------|-------------------------|
| **Spirit** as currency | **Spirit** (number on Player). Gained: COMMUNE, Oracle, defeating enemies. Spent: buying wares (item `value` = spirit cost). Selling wares grants spirit. |
| **Blood** as price | **Blood** (number on Player). Gained: dealing/killing in combat (martyrs’ blood / spilled blood). Optional **bloodPrice** on Item for high-tier or ritual wares; buying deducts blood when required. |
| **Sacrifice** | **Sacrifice** mechanic: discard an item (from inventory) to gain spirit (e.g. half its value). "What you give up for gain." |

### Design rules (Platform)

1. **No gold/coins.** Only spirit, blood, and sacrifice (item-for-spirit).
2. **Spirit** is the main trade currency: prices in spirit; sell grants spirit.
3. **Blood** is the ritual/revelation price: optional on items; combat can grant blood.
4. **Sacrifice** is explicit: discard item → gain spirit (and optionally log "sacrifice" in narrative).
5. **Copy/flavor**: Log and UI use "Spirit", "Blood", "Sacrifice" (e.g. "Paid in spirit and blood.", "Sacrificed X for spirit.").

---

## 4. Implementation checklist (Platform)

- [x] **Types**: `Player.spirit`, `Player.blood`; `Item.value` = spirit cost; `Item.bloodPrice?` optional.
- [x] **Engine**: `initializePlayer` sets spirit (e.g. 20), blood (0). Deterministic start: same. WARE_POOL: some items have `bloodPrice`.
- [x] **Buy**: Require `player.spirit >= (item.value ?? 0)` and `player.blood >= (item.bloodPrice ?? 0)`; deduct both when present.
- [x] **Sell**: Grant spirit (e.g. `Math.floor((item.value ?? 0) / 2)` or full value).
- [x] **Spirit gain**: COMMUNE (+1), Oracle (+1), defeat enemy (+5 or similar).
- [x] **Blood gain**: On enemy defeat (+2 or similar; "martyrs’ blood / spilled blood").
- [x] **Sacrifice**: Action "Sacrifice item" — remove from inventory, add spirit (e.g. `Math.floor((item.value ?? 0) / 2)`).
- [x] **UI**: Player header shows Spirit, Blood. Trade panel shows spirit cost and blood price; Buy disabled when insufficient. Sacrifice button in inventory or trade.

---

## 5. References (exact quotes)

**qvht index.html**
- *"Our ego, that is our sense of self is a shadow of what we spend spirit on. Currency becomes."*
- *"Everything is spirit."*

**qvht echoes-of-the-abyssal-maw.html**
- *"A price paid in blood and sacrifice."*
- *"#RitualSacrifice"*, *"#MartyrsBlood"*
- *"the pursuit of knowledge is worth any sacrifice"*
- *"It requires sacrifice, courage, and a willingness to embrace the darkness within."*

**forboc**
- *"We find our spirit amidst eerie foliage."* (index/og:description)
