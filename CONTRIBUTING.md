# Contributing to SmartTraffic AI

SmartTraffic AI is primarily a graduation thesis and startup prototype. Contributions should keep the project stable, thesis-ready, and practical for deployment.

## Contribution Guidelines

- Keep changes focused and easy to review.
- Do not include secrets, API keys, model credentials, or private datasets.
- Do not commit generated local configuration folders.
- Do not modify AI weight files unless the change is explicitly approved.
- Avoid unrelated refactors in feature or bug-fix pull requests.
- Preserve compatibility with Railway backend deployment and Vercel frontend deployment.

## Code Style

Backend:

- Use Python 3.10+.
- Follow the existing FastAPI, SQLModel, and service-layer patterns.
- Keep route handlers thin; place reusable logic in services.
- Run backend checks when possible:

```bash
cd backend
uv run ruff check app
uv run ruff format app --check
uv run mypy app
uv run ty check app
```

Frontend:

- Use TypeScript and React patterns already present in `frontend/src`.
- Keep UI consistent with the current SmartTraffic AI dark dashboard style.
- Use existing UI components before adding new ones.
- Run frontend checks when possible:

```bash
cd frontend
npm run build
```

## Branch Naming

Use short, descriptive branch names:

- `feature/subscription-admin`
- `fix/upload-debug`
- `docs/thesis-readme`
- `chore/dependency-cleanup`
- `refactor/analytics-service`

## Commit Message Format

Use clear imperative messages:

```text
fix: handle empty OCR results in upload detection
feat: add subscription status endpoint
docs: refresh thesis README
chore: remove obsolete local config
```

Recommended prefixes:

- `feat`
- `fix`
- `docs`
- `chore`
- `refactor`
- `test`
- `ci`

## Bug Reports

When reporting a bug, include:

- Summary of the issue.
- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Screenshots or API responses if relevant.
- Environment: local, Railway, Vercel, browser, OS.
- Backend logs or frontend console errors if available.

For AI detection issues, include:

- Whether the issue is upload detection or realtime camera detection.
- Debug response from `/api/v1/detections/upload` if available.
- Whether vehicle, plate, or OCR stage returned zero results.
- Image quality notes, but do not upload sensitive real-world evidence publicly.

## Pull Request Process

1. Create a focused branch.
2. Make the smallest change that solves the issue.
3. Update documentation if behavior changes.
4. Run relevant checks.
5. Open a pull request with:
   - What changed.
   - Why it changed.
   - How it was tested.
   - Screenshots for UI changes.
6. Wait for review before merging.

## Areas That Need Extra Care

- Authentication and account management.
- Subscription activation and payment demo flow.
- Detection persistence and database migrations.
- AI model loading, thresholds, and OCR behavior.
- Deployment configuration for Railway and Vercel.

## Non-Goals for Casual Contributions

- Replacing the AI models without a documented evaluation process.
- Adding real payment credentials to the repository.
- Rewriting the frontend design system.
- Reworking deployment architecture without a clear thesis or product reason.
