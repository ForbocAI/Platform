# Qua'dar Single-Player Gameplay Testing & Improvements

## Phase 1: Research & Planning
- [x] Read PLAYTEST_AUTOMATION.md (current test state)
- [x] Read CURRENCY_AUDIT.md (economy design)
- [x] Read quadar.md (game world, characters, classes, spells)
- [/] Read quadar_familiar.md (d100/d20 tables, modifiers, Speculum)
- [ ] Read condensed.md (code standards)
- [ ] Explore current src/ architecture (components, features, screens)
- [ ] Explore Forboc/client/src (ECS reference architecture)
- [ ] Create implementation plan

## Phase 2: Architecture Audit & Refactoring
- [ ] Audit file/folder/function/variable names for lore-agnosticism
- [ ] Audit ECS architecture alignment (features directory)
- [ ] Audit component composition (generic → unique → screens)
- [ ] Refactor files into subdomains by line count
- [ ] Ensure features/ uses ECS sub-organized by domain

## Phase 3: Browser Playtest & Bug Identification
- [ ] Start dev server, open localhost:3000
- [ ] Test Init flow (class selection, deterministic)
- [ ] Test Movement & Map
- [ ] Test SCAN, ENGAGE, COMMUNE, Oracle, Facts
- [ ] Test Vignette & Stage progression
- [ ] Test Trading, Inventory, Currency (spirit/blood/sacrifice)
- [ ] Test Combat, Spells, XP, Level Progression
- [ ] Test Hazards, NPCs, Concession/Death
- [ ] Test Crafting & Farming (mushroom system)
- [ ] Test Quests & Session scoring
- [ ] Test Auto-play intelligence
- [ ] Test Servitors & Companions

## Phase 4: Improvements & Enhancements
- [ ] Fix bugs found during playtest
- [ ] Improve autoplay AI (use all game features)
- [ ] Add more mushroom types with different effects
- [ ] Enhance lore UX (Quadar/Forboc/Qvht alignment)
- [ ] Balance improvements (combat, economy, progression)
- [ ] UX polish (visual feedback, animations, flow)

## Phase 5: Documentation
- [ ] Update PLAYTEST_AUTOMATION.md with new test coverage
- [ ] Document reproduction steps for any new issues
- [ ] Update Known issues section
