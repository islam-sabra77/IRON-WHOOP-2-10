import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:8790', viewport: { width: 420, height: 900 }, serviceWorkers: 'allow' },
  webServer: { command: 'node dev-server.mjs 8790', url: 'http://localhost:8790/index.html', reuseExistingServer: true, timeout: 30_000 },
});
