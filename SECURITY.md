# Security Policy

## Supported Versions

SmartTraffic AI is in active development as a thesis project and startup prototype.

| Version / Branch | Supported |
| --- | --- |
| `main` | Yes |
| Active thesis/demo deployments | Yes |
| Older experimental branches | No |

## Reporting a Vulnerability

Please report security issues privately. Do not open a public GitHub issue for vulnerabilities.

Security contact email:

```text
security@example.com
```

Replace this placeholder with the project maintainer's real security contact before public release.

When reporting, include:

- Affected component: backend, frontend, deployment, database, authentication, file upload, AI pipeline, or subscription flow.
- Clear reproduction steps.
- Impact assessment.
- Logs, screenshots, or request samples if safe to share.
- Suggested remediation if known.

## Responsible Disclosure

We ask reporters to:

- Give maintainers reasonable time to investigate and fix issues.
- Avoid accessing, modifying, or deleting data that does not belong to you.
- Avoid disrupting deployed services.
- Avoid sharing exploit details publicly before a fix is available.

We aim to acknowledge valid reports within 7 days and provide a remediation plan or status update as soon as practical.

## Authentication Notes

- The application uses JWT-based authentication for standard user login.
- Password hashing is handled by backend security utilities.
- Production deployments must use a strong `SECRET_KEY`.
- Admin credentials must be changed from any local demo defaults before deployment.
- Do not commit `.env` files, access tokens, credentials, or database URLs.

## Deployment Notes

Frontend:

- Hosted on Vercel.
- Must point `VITE_API_URL` to the intended backend.
- CORS should only allow trusted frontend origins in production.

Backend:

- Hosted on Railway.
- Uses PostgreSQL for persistent data.
- `/railway-health` is intended for deployment health checks.
- API docs are exposed at `/docs`; restrict or monitor access as needed for production.

Database:

- Use managed PostgreSQL credentials from the deployment provider.
- Rotate credentials if they are exposed.
- Back up important thesis/demo data before migrations.

AI and File Upload:

- Uploaded files should be treated as untrusted input.
- Do not expose raw private evidence images publicly.
- AI model weight files should be stored and deployed intentionally.
- Do not accept arbitrary model paths from user input.

Subscription and Payment:

- The current MoMo payment flow is a demo prototype.
- No real payment gateway secret keys should be committed.
- Future real payment integration must use provider-side verification and secure secret management.

## Out of Scope

The current thesis prototype does not provide a formal bug bounty program. Reports are appreciated, but rewards are not guaranteed.
