# TaskFlow

A small full-stack task manager, built specifically to give you enough real
surface area to practice **advanced GitHub Actions / CI-CD** — not just
"run npm test on push."

- **Backend**: Node.js + Express + PostgreSQL (JWT auth, projects, tasks)
- **Frontend**: React + Vite (talks to the API)
- **Tests**: unit tests (Jest / Vitest), integration tests against a real
  Postgres database (Supertest), and browser e2e tests (Playwright)
- **Containers**: multi-stage Dockerfiles for both services, plus a
  docker-compose stack for local dev

The app itself is intentionally uncomplicated — the point isn't the todo
app, it's everything *around* it: linting, matrixed test runs, service
containers, image builds, registries, environments, and deploys.

## Project layout

```
taskflow/
├── backend/            Express API (src/, tests/unit, tests/integration)
├── frontend/            React app (src/, tests/e2e)
├── docker-compose.yml   Local dev stack: postgres + backend + frontend
└── .github/workflows/   <- empty on purpose, this is where you'll work
```

## Running it locally

**Option A — Docker Compose (easiest):**

```bash
docker compose up --build
# API:      http://localhost:4000/api/health
# Frontend: http://localhost:8080
```

**Option B — manually:**

```bash
# 1. Start Postgres however you like, then:
cp backend/.env.example backend/.env   # edit DATABASE_URL if needed

# 2. Backend
cd backend
npm install
npm run migrate
npm run dev          # http://localhost:4000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

> Both Dockerfiles use `npm install` rather than `npm ci` because no
> `package-lock.json` is committed yet (this repo was scaffolded without
> network access). Run `npm install` locally once in `backend/` and
> `frontend/` to generate real lockfiles, commit them, then switch the
> Dockerfiles (and your CI workflows) to `npm ci` — it's faster and fully
> reproducible, which matters a lot once you're caching CI dependencies.

## Running the tests locally

```bash
# Backend unit tests (no DB needed)
cd backend && npm run test:unit

# Backend integration tests (needs DATABASE_URL pointed at a real Postgres)
cd backend && npm run test:integration

# Frontend unit tests
cd frontend && npm test

# Frontend e2e tests (builds the app and drives a real browser)
cd frontend && npx playwright install --with-deps chromium
cd frontend && npm run test:e2e
```

Get comfortable running these locally first — it makes debugging a failing
CI run *much* faster when you already know what "passing" looks like.

---

## GitHub Actions practice roadmap

Work through these roughly in order. Each tier assumes the previous one
works. Nothing here is wired up for you — `.github/workflows/` is empty;
building it out *is* the exercise. Push to a real GitHub repo so you get
real Actions runs, real logs, and real failures to debug.

### Tier 1 — Foundations
- [ ] Workflow that triggers on `push` to `main` and on every `pull_request`
- [ ] Job that checks out the repo and runs `npm run lint` for the backend
- [ ] Same for the frontend
- [ ] Job that runs backend unit tests (`npm run test:unit`, no DB needed)
- [ ] Job that runs frontend unit tests
- [ ] Use `actions/setup-node` with `cache: 'npm'` so dependency installs
      are fast on repeat runs
- [ ] Turn "test on one Node version" into a **build matrix** across two or
      three Node versions (e.g. 18.x, 20.x, 22.x)

### Tier 2 — Integration testing with real services
- [ ] Add a `postgres` **service container** to a job so backend
      integration tests run against a real database
- [ ] Get the job to wait for Postgres to be healthy before tests start
      (health checks, not a sleep)
- [ ] Run `npm run migrate` as an explicit CI step before the tests
- [ ] Upload the Jest coverage report as a build **artifact**
- [ ] Add a status badge to this README once the workflow exists

### Tier 3 — Docker builds & registries
- [ ] Build the backend and frontend Docker images in CI using Buildx
- [ ] Cache Docker layers between runs (GitHub Actions cache backend, not
      just re-pulling base images every time)
- [ ] Push built images to GitHub Container Registry (GHCR), tagged with
      both the git SHA and the branch name
- [ ] Make sure images are only **pushed** on merges to `main`, never from
      pull requests from forks
- [ ] Scan the built images for known CVEs (e.g. Trivy) and fail the job on
      critical findings
- [ ] Add a dependency-audit step (`npm audit` or Dependabot) as a gate

### Tier 4 — Real pipeline orchestration
- [ ] Split lint / unit-test / integration-test / build into separate,
      **parallel** jobs
- [ ] Use `needs:` to make `build` only run after tests pass — draw the
      dependency graph on paper first if it helps
- [ ] Add path filters so a frontend-only change doesn't trigger backend
      jobs (and vice versa) — look at `paths:`/`paths-ignore:` on triggers,
      or the `dorny/paths-filter` action for finer control within one
      workflow
- [ ] Extract the repeated "install, lint, test a Node service" steps into
      a **reusable workflow** (`workflow_call`) shared by backend and
      frontend
- [ ] Extract the Docker build-and-push steps into a **composite action**
      under `.github/actions/`
- [ ] Add a `concurrency:` group so superseded runs on the same PR get
      cancelled automatically instead of piling up

### Tier 5 — Environments & deployment
- [ ] Create `staging` and `production` **Environments** in the repo
      settings
- [ ] Auto-deploy to `staging` on every successful merge to `main`
- [ ] Require **manual approval** before a `production` deploy runs
      (environment protection rules)
- [ ] Use environment-scoped secrets/variables — e.g. a different
      `DATABASE_URL` per environment — instead of one global secret
- [ ] Actually deploy somewhere real: a small VM over SSH, a PaaS like
      Fly.io / Render / Railway, or even just `docker compose` on a remote
      host via an action — pick something you can point a browser at
- [ ] Build a `workflow_dispatch`-triggered **rollback** workflow that lets
      you pick a previous image tag and redeploy it

### Tier 6 — Advanced / expert
- [ ] Adopt Conventional Commits and wire up `semantic-release` (or
      Changesets) to auto-bump versions and generate a changelog
- [ ] Auto-create GitHub Releases with that changelog and the built
      artifacts attached
- [ ] Add a CodeQL workflow for static security analysis
- [ ] Add a scheduled (`cron`) workflow that runs the Playwright e2e suite
      nightly against staging
- [ ] Extend the e2e job to spin up the full `docker-compose` stack
      (db + backend + frontend) inside the runner and test against it end
      to end
- [ ] Send a notification (Slack/Discord webhook) when a build on `main`
      fails
- [ ] Set up OIDC so a deploy job authenticates to a cloud provider (e.g.
      assumes an AWS IAM role) without storing any long-lived cloud
      credentials as secrets
- [ ] Simulate a canary or blue-green deploy: ship to a fraction of
      traffic or a secondary environment first, with a manual promotion
      step before it goes fully live
- [ ] Turn on branch protection on `main` requiring your CI checks to pass
      before merge — then intentionally break something on a branch to
      confirm it's actually blocked

---

## Notes on the app itself, if you extend it

- Auth is JWT-based; every project/task endpoint requires
  `Authorization: Bearer <token>` and is scoped to the logged-in user —
  useful if you want to add more integration tests around authorization.
- The DB schema lives in `backend/src/db/migrations/`; add a new
  `00N_*.sql` file and it'll be picked up by `npm run migrate` automatically.
- `GET /api/health` checks DB connectivity too, so it's a reasonable smoke
  check to hit right after a deploy.

