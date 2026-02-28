# Agent Guide

Read `~/Projects/meta/agent-scripts/AGENTS.md` first.

## DOCs

- Canonical docs index: `docs/README.md`
- Canonical gameplay behavior spec: `docs/GAME_RULES_SPEC.md`
- Rulebook parity tracker: `docs/RULEBOOK_PARITY.md`
- For work on game assets: `ui/ASSET_SPEC.md`
- For frontend app setup/scripts: `ui/README.md`
- Brand/font/color guide: `docs/BRAND_GUIDELINES.md`

## Documentation Maintenance (Required)

- Treat docs as part of the deliverable for every code change.
- If behavior, config, setup, routes, assets, or workflows change, update the corresponding docs in the same change.
- If no doc update is needed, explicitly state: `Docs Impact: none` and why.

### Normative gameplay sources

- Base: `docs/rulebooks/Rulebook-Base.pdf` (summary: `docs/rulebooks/summaries/Rulebook-Base-Summary.md`, text: `docs/rulebooks/text/Rulebook-Base.txt`)
- Cities and Knights: `docs/rulebooks/Rulebook-Cities&Knights.pdf` (summary: `docs/rulebooks/summaries/Rulebook-CitiesAndKnights-Summary.md`, text: `docs/rulebooks/text/Rulebook-CitiesAndKnights.txt`)
- Seafarers: `docs/rulebooks/Rulebook_Seafarers.pdf` (summary: `docs/rulebooks/summaries/Rulebook-Seafarers-Summary.md`, text: `docs/rulebooks/text/Rulebook-Seafarers.txt`)
- Agents should treat these rulebooks as normative gameplay intent (PDF authority; summaries for quick read; text extracts for deep search).
- Any intentional implementation deviation must be documented in `docs/RULEBOOK_PARITY.md`.

### Doc ownership map

- Setup/run/dev flow: `docs/QUICK_START.md`, `docs/LOCAL_SETUP_UBUNTU.md`, `docs/TROUBLESHOOTING.md`
- Environment variables/secrets: `docs/ENVIRONMENT.md`
- Architecture/runtime flow/protocols: `docs/ARCHITECTURE.md`
- Gameplay rules and mode behavior: `docs/GAME_RULES_SPEC.md`
- Rulebook parity and deviations: `docs/RULEBOOK_PARITY.md`
- Expansion rules/status: `docs/SEAFARERS_MVP.md`, `docs/SEAFARERS_PARITY_CHECKLIST.md`
- UI/asset structure and checks: `ui/ASSET_SPEC.md`, `ui/ASSET_MIGRATION_CHECKLIST.md`, `ui/ASSET_SMOKE_CHECKLIST.md`, `ui/README.md`
- Root project summary: `README.md`

### Required end-of-task checks

1. Docs Impact Check: determine which files in the map above are affected by the code changes.
2. For gameplay changes, check the relevant rulebook and update `docs/GAME_RULES_SPEC.md` and `docs/RULEBOOK_PARITY.md`.
3. Update affected docs in the same patch/commit.
4. Verify references and commands in edited docs still match the repo.
5. Report updated docs in the final response under `Docs Updated`.


### If ambiguous

- Ask one concise clarification question with 2-3 options.
- If confidence is high (>80%), proceed and report assumptions.
