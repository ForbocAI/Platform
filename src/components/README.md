# Components

**Folder structure (maintain this):**

- **elements/generic** — Reusable primitives (buttons, modal, overlay, stat box). No domain types.
- **elements/unique** — Domain components by subdomain: `game/`, `narrative/`, `shared/`.
- **screens** — Full-page screens; one folder per screen (e.g. `GameScreen/`).

**Composition:**

- Screens → use **unique** and **generic** components as much as possible.
- Unique → use **generic** components as much as possible.
- Generic → no domain imports; stay domain-agnostic.

See `docs/COMPONENTS.md` and `.cursor/rules/components-structure.mdc` for details.
