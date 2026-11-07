import { expect, test } from '@playwright/test';

test('startpagina toont de titel met het design system onder het subpad', async ({ page }) => {
  const kapot: string[] = [];
  page.on('response', (antwoord) => {
    if (antwoord.status() >= 400) kapot.push(`${antwoord.status()} ${antwoord.url()}`);
  });
  page.on('requestfailed', (verzoek) => kapot.push(`mislukt ${verzoek.url()}`));

  await page.goto('/workshop-test-breuken/');

  await expect(page).toHaveTitle('Breuken oefenen');
  const titel = page.getByRole('heading', { level: 1, name: 'Breuken oefenen' });
  await expect(titel).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');

  // De kleuren: de kop is forest (#103e18), de pagina bg (#fcfcf8).
  await expect(titel).toHaveCSS('color', 'rgb(16, 62, 24)');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(252, 252, 248)');

  // Het lettertype: Figtree is echt geladen, niet alleen gevraagd.
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.fonts].some((f) => f.family.includes('Figtree') && f.status === 'loaded'),
      ),
    )
    .toBe(true);

  // Het logo en het gedrag van het design system.
  const logo = page.getByRole('img', { name: 'Arcadia scholen' });
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => typeof window.ArcadiaAI?.init)).toBe('function');

  // Geen enkele link naar een bestand is kapot.
  expect(kapot).toEqual([]);
});
