---
description: Run all linters and type checkers for backend (ruff + mypy + ty) and frontend (biome). Auto-fix where possible.
---

Run all linters for the SmartTraffic AI project. Execute these steps in order:

**Backend** (from `backend/` directory using `uv`):
1. `uv run ruff check app --fix` — fix auto-fixable issues
2. `uv run ruff format app` — format code
3. `uv run mypy app` — strict type checking
4. `uv run ty check app` — ty type checker

**Frontend** (from project root):
5. `bun run --filter frontend lint` — biome check with auto-fix

Report any errors that could not be auto-fixed and suggest how to resolve them. If all pass, confirm everything is clean.
