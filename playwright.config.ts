import { defineConfig, devices } from '@playwright/test';

const port = 4322;

// De test draait op de gebouwde site, dus op wat er echt gepubliceerd wordt.
// Een eigen poort en geen hergebruik: zo test je nooit per ongeluk een oude versie.
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // --ignore-lock houdt de server op de voorgrond, ook als een AI-agent de test start.
    // Anders gaat Astro naar de achtergrond en denkt Playwright dat de server gestopt is.
    command: `npm run build && npm run preview -- --port ${port} --ignore-lock`,
    url: `http://localhost:${port}/workshop-test-breuken/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
