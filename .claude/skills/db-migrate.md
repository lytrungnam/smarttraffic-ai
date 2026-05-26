---
description: Create and apply Alembic database migrations for backend model changes. Handles new migration creation, upgrade, downgrade, and history inspection.
---

Manage Alembic database migrations for SmartTraffic AI. All commands run from `backend/` using `uv run alembic`.

**Determine what the user wants:**

- **Create a new migration** (after changing a SQLModel in `app/models/`):
  ```
  cd backend && uv run alembic revision --autogenerate -m "describe_the_change"
  ```
  Then open the generated file in `app/alembic/versions/` and verify the auto-generated `upgrade()` and `downgrade()` functions are correct before applying.

- **Apply all pending migrations:**
  ```
  cd backend && uv run alembic upgrade head
  ```

- **Rollback one migration:**
  ```
  cd backend && uv run alembic downgrade -1
  ```

- **Check current migration state:**
  ```
  cd backend && uv run alembic current
  ```

- **View migration history:**
  ```
  cd backend && uv run alembic history --verbose
  ```

**Important notes:**
- The database must be running (Docker: `docker compose up -d db`) before running any alembic command.
- After `--autogenerate`, always read the generated migration file and confirm with the user before running `upgrade head`.
- Migrations live in `backend/app/alembic/versions/`. New files must have a unique revision ID (auto-assigned).
- The `Detection` → `Camera` relationship uses cascade delete — preserve this in any migration touching those tables.
