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

test('startpagina toont de uitleg voor leerlingen onder de knoppen', async ({ page }) => {
  await page.goto('/workshop-test-breuken/');

  const kop = page.getByRole('heading', { level: 2, name: 'Zo werkt het' });
  await expect(kop).toBeVisible();
  await expect(kop).toHaveCSS('color', 'rgb(16, 62, 24)');

  const stappen = page.getByRole('listitem');
  await expect(stappen).toHaveText([
    'Kies Vereenvoudigen of Optellen.',
    'Typ je antwoord als een breuk, bijvoorbeeld 1/2, en klik op Controleer.',
    'Je ziet meteen of je antwoord juist is. Is het niet juist, dan zie je het juiste antwoord.',
  ]);
  for (const stap of await stappen.all()) await expect(stap).toBeVisible();
  // Een echte genummerde lijst, niet zomaar drie regels.
  await expect(page.locator('main ol > li')).toHaveCount(3);

  const tekst = page.getByText('Vereenvoudig je antwoord altijd zo ver als het kan');
  await expect(tekst).toBeVisible();
  await expect(tekst).toHaveText(
    'Vereenvoudig je antwoord altijd zo ver als het kan: als de uitkomst 1/2 is, dan telt 2/4 niet. Lukt een oefening niet? Dan kan je ze overslaan. Je hoeft je niet aan te melden en er wordt niets bewaard.',
  );

  // De knoppen blijven bovenaan: de uitleg begint pas onder de knoppen.
  for (const naam of ['Vereenvoudigen', 'Optellen']) {
    const knop = await page.getByRole('link', { name: naam, exact: true }).boundingBox();
    const kader = await kop.boundingBox();
    expect(knop!.y + knop!.height).toBeLessThanOrEqual(kader!.y);
  }
});

for (const { naam, pad } of [
  { naam: 'Vereenvoudigen', pad: 'vereenvoudigen' },
  { naam: 'Optellen', pad: 'optellen' },
]) {
  test(`de knop ${naam} leidt naar de juiste pagina onder het subpad`, async ({ page }) => {
    await page.goto('/workshop-test-breuken/');

    await page.getByRole('link', { name: naam, exact: true }).click();

    await expect(page).toHaveURL(`/workshop-test-breuken/${pad}/`);
    await expect(page.getByRole('heading', { level: 1, name: naam })).toBeVisible();
  });
}

test('startpagina past op de breedte van een gsm', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/workshop-test-breuken/');

  await expect(page.getByRole('heading', { level: 2, name: 'Zo werkt het' })).toBeVisible();
  const breedte = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(breedte).toBeLessThanOrEqual(320);
});
