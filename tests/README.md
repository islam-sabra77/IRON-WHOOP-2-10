# Tests

```bash
cd tests
npm install
npx playwright install chromium   # first time only
npm test                          # unit checks, then browser tests
```

- `unit/` — fast checks with no browser: scripts parse, `index.html` and `sw.js` list every script, no duplicate top-level names across scripts, and the Netlify functions (sync, error log) against an in-memory store.
- `e2e/` — Playwright tests in Chromium against `dev-server.mjs`, which serves the app and runs the Netlify functions locally.
- GitHub Actions runs everything on every pull request (`.github/workflows/tests.yml`).
