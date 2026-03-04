# CI Pipeline Checklist -- quality.yml

## Stage 1: Checkout Code

- [ ] actions/checkout@v4 with full history
- [ ] Failure behavior: pipeline aborts immediately
- **Notes:**

## Stage 2: Node 20 Setup + npm ci

- [ ] actions/setup-node@v4 with node-version 20
- [ ] Cache node_modules via actions/cache (key: hashFiles('package-lock.json'))
- [ ] npm ci (clean install, respects lockfile)
- [ ] Failure behavior: pipeline aborts; no point running JS stages without deps
- **Required env vars:** none
- **Notes:**

## Stage 3: TypeScript Check

- [ ] npx tsc --noEmit
- [ ] Validates all .ts and .tsx files compile without errors
- [ ] Failure behavior: pipeline fails; type errors block merge
- **Required env vars:** none
- **Notes:**

## Stage 4: Vite Build

- [ ] npm run build
- [ ] Produces dist/index.cjs (server) and dist/public/ (client)
- [ ] Failure behavior: pipeline fails; build errors block merge
- **Required env vars:** none (build should not require runtime secrets)
- **Notes:**

## Stage 5: Python 3.12 Setup + pip install

- [ ] actions/setup-python@v5 with python-version 3.12
- [ ] pip install -r requirements.txt (if exists)
- [ ] Cache pip packages via actions/cache
- [ ] Failure behavior: pipeline fails if Python deps missing
- **Required env vars:** none
- **Notes:**

## Stage 6: Python Unit Tests

- [ ] python -m unittest discover -s tests -p "test_*.py"
- [ ] Failure behavior: pipeline fails; test failures block merge
- **Required env vars:** none (tests should mock external services)
- **Notes:**

## Stage 7: Notebook Smoke Test

- [ ] Execute notebooks with timeout (jupyter nbconvert --execute or papermill)
- [ ] Failure behavior: pipeline fails; notebook execution errors block merge
- **Required env vars:** none (notebooks should use sample data)
- **Notes:**

---

## Caching Strategy

| Cache Target | Key | Restore Key |
|---|---|---|
| node_modules | node-modules-${{ hashFiles('package-lock.json') }} | node-modules- |
| pip packages | pip-${{ hashFiles('requirements.txt') }} | pip- |

## Branch Protection Rules

- [ ] Require status checks to pass before merging
- [ ] Require all CI stages (TypeScript check, Vite build, Python tests, notebook smoke) to pass
- [ ] Require pull request reviews (minimum 1)
- [ ] Require up-to-date branches before merging
- [ ] Do not allow bypassing required status checks

## Required CI Environment Variables

| Variable | Required For | Source |
|---|---|---|
| GITHUB_TOKEN | actions/checkout | Automatic |
| NODE_AUTH_TOKEN | private npm registries (if any) | Repository secret |

## Future Additions

- [ ] ESLint stage (npx eslint . --ext .ts,.tsx)
- [ ] npm audit --audit-level=high
- [ ] Vitest or Jest unit test runner for JavaScript
- [ ] Coverage reporting (codecov or similar)
- [ ] Docker image build verification
