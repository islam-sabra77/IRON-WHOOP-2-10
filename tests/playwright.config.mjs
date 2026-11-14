import { defineConfig, devices } from '@playwright/test';
// Chromium runs everything. With IRON_WEBKIT=1 (set in CI), the key flows also run in WebKit,
// (service workers off there: Playwright can't intercept a WebKit page's requests while one is active)
// Safari's engine, as an iPhone, since most people use IRON on iPhone.
const projects = [{ name: 'chromium', use: { browserName: 'chromium' } }];
if (process.env.IRON_WEBKIT === '1') projects.push({ name: 'iphone-webkit', use: { ...devices['iPhone 14'], browserName: 'webkit', serviceWorkers: 'block' }, testMatch: /(customize|activities|timer|app|launch|quickstart)\.spec\.mjs/ });
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:8790', viewport: { width: 420, height: 900 }, serviceWorkers: 'allow' },
  projects,
  webServer: { command: 'node dev-server.mjs 8790', url: 'http://localhost:8790/index.html', reuseExistingServer: true, timeout: 30_000 },
});
