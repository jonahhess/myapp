# Testing Strategy (Deliberate + Rate-Limited)

This project uses a three-layer test strategy to maximize confidence while minimizing requests to the production-like backend.

## Layer 1: Fast Local Unit Tests (No Network)

Purpose:

- Validate payload normalization and service behavior without touching the server.

Commands:

- npm run test:unit

What is covered now:

- Request normalization contracts.
- usersService endpoint/method mapping and auth token handling.

## Layer 2: Local Integration Tests (Mocked API)

Purpose:

- Validate page behavior, rendering logic, and UX rules with deterministic mock data.

Commands:

- npm run test:integration
- npm run test:integration:admin
- npm run test:integration:recruiter

What is covered now:

- Admin dashboard user listing, search filtering, and admin-delete protection.
- Admin delete confirmation and successful non-admin deletion flow (mocked).
- Recruiter My Jobs listing, delete confirmation flow, and create-job navigation.

## Layer 3: Production Smoke Tests (Very Low Traffic)

Purpose:

- Confirm critical backend wiring with real requests using strict controls.

Command (read-only smoke):

- npm run test:smoke:prod

Optional command (includes no-op profile PUT):

- npm run test:smoke:prod:mutations

Admin-focused command (read-only by default):

- npm run test:smoke:prod:admin

Recruiter-focused command (read-only by default):

- npm run test:smoke:prod:recruiter

Traffic controls built in:

- Single worker only.
- Sequential tests only.
- Delay between every request (default 1200ms).
- Automatic backoff/retry on HTTP 429 using Retry-After when provided.
- Minimal request count by default (login, profile read, optional admin list read).
- Dedicated admin smoke verifies admin login and /users list access with strict pacing.
- Dedicated recruiter smoke verifies recruiter login and /jobs/my-jobs access with strict pacing.
- Missing non-admin/recruiter smoke users can be auto-registered before login.

## Environment Variables for Smoke Tests

Copy .env.smoke.example to .env and fill values:

Required:

- PROD_API_BASE_URL
- SMOKE_USER_EMAIL
- SMOKE_USER_PASSWORD

Optional:

- SMOKE_ADMIN_EMAIL
- SMOKE_ADMIN_PASSWORD
- SMOKE_NON_ADMIN_EMAIL
- SMOKE_NON_ADMIN_PASSWORD
- SMOKE_RECRUITER_EMAIL
- SMOKE_RECRUITER_PASSWORD
- SMOKE_REQUEST_GAP_MS (default: 1200)
- SMOKE_MAX_429_RETRIES (default: 2)
- RUN_PROD_MUTATION_SMOKE (default: false)
- RUN_PROD_RECRUITER_MUTATION_SMOKE (default: false)
- RUN_PROD_AUTO_REGISTER (default: true)

## Safety Rules for Production-Like Testing

- Run smoke tests manually only, never on every push.
- Keep mutation smoke disabled unless specifically needed.
- Use dedicated test accounts, not personal/admin accounts.
- Start with default gap and increase if you encounter 429s.
- If the server is under load, skip smoke tests and rely on Layer 1+2 until quiet.

## Suggested CI/CD Policy

- Pull requests:
  - Run Layer 1 + Layer 2 only.
- Scheduled or manual release verification:
  - Run Layer 3 with controlled credentials and timing.
