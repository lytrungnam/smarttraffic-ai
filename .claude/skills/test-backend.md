---
description: Run backend Python tests with coverage report. Optionally run a single test file or test function.
---

Run backend tests for the SmartTraffic AI project from the `backend/` directory.

**Run all tests with coverage:**
```
cd backend && uv run coverage run -m pytest tests/ && uv run coverage report && uv run coverage html
```

**Run a single test file** (if the user specifies one):
```
cd backend && uv run pytest tests/path/to/test_file.py -v
```

**Run a single test function** (if the user specifies one):
```
cd backend && uv run pytest tests/path/to/test_file.py::test_function_name -v
```

After running, summarize:
- Total tests passed / failed / skipped
- Coverage percentage for `app/`
- Any failures with the relevant error message

If tests require a running database and fail with a connection error, remind the user to start the Docker stack first: `docker compose up -d db`
