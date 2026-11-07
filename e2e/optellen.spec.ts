import { expect, test, type Page } from '@playwright/test';

function ggd(a: number, b: number): number {
  return b === 0 ? a : ggd(b, a % b);
}

// Leest de som van het scherm en rekent de uitkomst hier zelf uit.
async function leesSom(page: Page) {
  const tekst = (await page.locator('#opgave').textContent()) ?? '';
  const [a, b, c, d] = tekst.split(/[/+]/).map(Number);
  const teller = a * d + c * b;
  const noemer = b * d;
  const deler = ggd(teller, noemer);
  const kleinTeller = teller / deler;
  const kleinNoemer = noemer / deler;
  return {
    tekst,
    juist: `${kleinTeller}/${kleinNoemer}`,
    nietVereenvoudigd: `${kleinTeller * 2}/${kleinNoemer * 2}`,
  };
}

async function openOptellen(page: Page) {
  await page.goto('/workshop-test-breuken/');
  await page.getByRole('link', { name: 'Optellen' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Breuken optellen');
  await expect(page.locator('#opgave')).toHaveText(/^\d+\/\d+ \+ \d+\/\d+$/);
}

test('een juist en een niet-vereenvoudigd antwoord geven de juiste terugkoppeling', async ({
  page,
}) => {
  await openOptellen(page);

  const veld = page.getByRole('textbox');
  const status = page.getByRole('status');
  const volgende = page.getByRole('button', { name: 'Volgende oefening' });
  await expect(veld).toBeFocused();
  await expect(volgende).toBeHidden();

  // Een juist antwoord, bevestigd met de knop.
  const eerste = await leesSom(page);
  await veld.fill(eerste.juist);
  await page.getByRole('button', { name: 'Controleer' }).click();
  await expect(status.getByText('Juist', { exact: true })).toBeVisible();
  await expect(status).not.toContainText('Niet juist');
  await expect(status.locator('.ai-feedback--correct svg')).toBeVisible();
  await expect(status).toContainText(`${eerste.tekst} = ${eerste.juist}.`);

  await volgende.click();
  const tweede = await leesSom(page);
  expect(tweede.tekst).not.toBe(eerste.tekst);
  await expect(veld).toHaveValue('');
  await expect(veld).toBeFocused();
  await expect(status).toBeEmpty();

  // Een antwoord dat even groot is maar niet vereenvoudigd, bevestigd met Enter.
  await veld.fill(tweede.nietVereenvoudigd);
  await veld.press('Enter');
  await expect(status.getByText('Niet juist', { exact: true })).toBeVisible();
  await expect(status.locator('.ai-feedback--wrong svg')).toBeVisible();
  await expect(status).toContainText(`Het juiste antwoord is ${tweede.juist}.`);
  await expect(status).toContainText('nog verder vereenvoudigen');

  await volgende.click();
  expect((await leesSom(page)).tekst).not.toBe(tweede.tekst);
  await expect(veld).toHaveValue('');
});

test('een antwoord dat geen breuk is telt niet, en de som blijft staan', async ({ page }) => {
  await openOptellen(page);
  const { tekst } = await leesSom(page);
  const status = page.getByRole('status');

  await page.getByRole('textbox').fill('abc');
  await page.getByRole('textbox').press('Enter');
  await expect(status).toContainText('Typ een breuk zoals 1/2.');
  await expect(page.locator('#opgave')).toHaveText(tekst);
  await expect(page.getByRole('button', { name: 'Volgende oefening' })).toBeHidden();
});

test('de som past op de breedte van een gsm', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openOptellen(page);

  const breedte = await page.evaluate(() => ({
    inhoud: document.documentElement.scrollWidth,
    scherm: document.documentElement.clientWidth,
  }));
  expect(breedte.inhoud).toBeLessThanOrEqual(breedte.scherm);
});
