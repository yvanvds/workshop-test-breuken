import { defineConfig } from 'vitest/config';

// De tests met de echte app staan in e2e/ en lopen via Playwright, niet via Vitest.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
