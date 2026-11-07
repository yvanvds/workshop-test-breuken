import { expect, test, type Page } from '@playwright/test';

function ggd(a: number, b: number): number {
  return b === 0 ? a : ggd(b, a % b);
}

// Leest de oefening van het scherm en rekent de uitkomst hier zelf uit.
async function leesOefening(page: Page) {
  const tekst = (await page.locator('#opgave').textContent()) ?? '';
  const [teller, noemer] = tekst.split('/').map(Number);
  const deler = ggd(teller, noemer);
  return { tekst, juist: `${teller / deler}/${noemer / deler}` };
}

async function openOefening(page: Page) {
  await page.goto('/workshop-test-breuken/');
  await page.getByRole('link', { name: 'Vereenvoudigen' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Breuken vereenvoudigen');
  await expect(page.locator('#opgave')).toHaveText(/^\d+\/\d+$/);
}

test('een juist en een fout antwoord geven de juiste terugkoppeling en een volgende oefening', async ({
  page,
}) => {
  await openOefening(page);

  const veld = page.getByRole('textbox');
  const status = page.getByRole('status');
  const volgende = page.getByRole('button', { name: 'Volgende oefening' });
  await expect(veld).toBeFocused();
  await expect(volgende).toBeHidden();

  // Een juist antwoord, bevestigd met de knop.
  const eerste = await leesOefening(page);
  await veld.fill(eerste.juist);
  await page.getByRole('button', { name: 'Controleer' }).click();
  await expect(status.getByText('Juist', { exact: true })).toBeVisible();
  await expect(status).not.toContainText('Niet juist');
  await expect(status.locator('.ai-feedback--correct svg')).toBeVisible();

  await volgende.click();
  const tweede = await leesOefening(page);
  expect(tweede.tekst).not.toBe(eerste.tekst);
  await expect(veld).toHaveValue('');
  await expect(veld).toBeFocused();
  await expect(status).toBeEmpty();
  await expect(volgende).toBeHidden();

  // Een fout antwoord, bevestigd met Enter: de oefening zelf is nog niet vereenvoudigd.
  await veld.fill(tweede.tekst);
  await veld.press('Enter');
  await expect(status.getByText('Niet juist', { exact: true })).toBeVisible();
  await expect(status.locator('.ai-feedback--wrong svg')).toBeVisible();
  await expect(status).toContainText(`Het juiste antwoord is ${tweede.juist}.`);

  await volgende.click();
  expect((await leesOefening(page)).tekst).not.toBe(tweede.tekst);
  await expect(veld).toHaveValue('');
  await expect(veld).toBeFocused();
});

test('een antwoord dat geen breuk is telt niet, en de oefening blijft staan', async ({ page }) => {
  await openOefening(page);
  const { tekst, juist } = await leesOefening(page);
  const veld = page.getByRole('textbox');
  const status = page.getByRole('status');

  for (const invoer of ['', 'abc', '1/0', '1,5/3', '-1/2']) {
    await veld.fill(invoer);
    await veld.press('Enter');
    await expect(status).toContainText('Typ een breuk zoals 1/2.');
    await expect(status).not.toContainText('juist');
    await expect(page.locator('#opgave')).toHaveText(tekst);
    await expect(page.getByRole('button', { name: 'Volgende oefening' })).toBeHidden();
  }

  // Daarna kan de leerling gewoon verder, en spaties maken niet uit.
  await veld.fill(` ${juist.replace('/', ' / ')} `);
  await veld.press('Enter');
  await expect(status.getByText('Juist', { exact: true })).toBeVisible();
});

test('de oefening past op de breedte van een gsm', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openOefening(page);
  const { tekst } = await leesOefening(page);

  await page.getByRole('textbox').fill(tekst);
  await page.getByRole('textbox').press('Enter');
  await expect(page.getByRole('button', { name: 'Volgende oefening' })).toBeVisible();

  const breedte = await page.evaluate(() => ({
    inhoud: document.documentElement.scrollWidth,
    scherm: document.documentElement.clientWidth,
  }));
  expect(breedte.inhoud).toBeLessThanOrEqual(breedte.scherm);
});
