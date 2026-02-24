# SAKURA Documentation

This folder contains the canonical docs for running and understanding SAKURA locally.

## Contents

- [Quick Start](./QUICK_START.md): fastest way to run the game locally.
- [Ubuntu Setup](./LOCAL_SETUP_UBUNTU.md): detailed Ubuntu instructions.
- [Environment Variables](./ENVIRONMENT.md): backend/frontend env reference with required values.
- [Architecture](./ARCHITECTURE.md): how backend, frontend, MongoDB, and websockets fit together.
- [Brand Guidelines](./BRAND_GUIDELINES.md): canonical visual direction, palette, and identity mapping.
- [Game Rules Spec](./GAME_RULES_SPEC.md): canonical gameplay behavior by mode (Base, Cities and Knights, Seafarers).
- [Rulebook Parity Log](./RULEBOOK_PARITY.md): alignment tracking versus official Base/Cities and Knights/Seafarers rulebooks.
- [Rulebooks](./rulebooks/README.md): official PDFs, searchable text extracts, and chapter-structured summaries for parity work.
- [Catan Timers Log](./CATAN_TIMERS_LOG.md): imported timer matrix and in-game speed mapping.
- [Catan Timers Source JSON](./data/catan_timers.json): source data used for timer tier import and mapping.
- [Seafarers MVP](./SEAFARERS_MVP.md): implemented Seafarers scope, rules, and validation notes.
- [Seafarers Parity Checklist](./SEAFARERS_PARITY_CHECKLIST.md): scenario-by-scenario completion status and rollout plan.
- [UI Migration Checklist](./UI_MIGRATION_CHECKLIST.md): architecture migration status + parity checklist.
- [Troubleshooting](./TROUBLESHOOTING.md): common local setup and runtime issues.

## Recommended Reading Order

1. Read [Quick Start](./QUICK_START.md)
2. If you are on Ubuntu, follow [Ubuntu Setup](./LOCAL_SETUP_UBUNTU.md)
3. Use [Environment Variables](./ENVIRONMENT.md) when creating `.env` files
4. Use [Troubleshooting](./TROUBLESHOOTING.md) if anything fails
5. Read [Architecture](./ARCHITECTURE.md) for deeper understanding

## Source of Truth Notes

- Local run/setup behavior: `QUICK_START.md` and `LOCAL_SETUP_UBUNTU.md`
- Runtime/backend/frontend architecture: `ARCHITECTURE.md`
- Visual direction and identity system: `BRAND_GUIDELINES.md`
- Gameplay behavior by mode: `GAME_RULES_SPEC.md`
- Rulebook alignment/deviations: `RULEBOOK_PARITY.md`
- Rulebook source files and extracts: `rulebooks/README.md`
- Env contract: `ENVIRONMENT.md`
- Seafarers scope and rollout status: `SEAFARERS_MVP.md` and `SEAFARERS_PARITY_CHECKLIST.md`
- UI asset layout and migration status: `../ui/ASSET_SPEC.md` and `../ui/ASSET_MIGRATION_CHECKLIST.md`
