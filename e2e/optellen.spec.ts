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

test('de som past op de breedte van een gsm, met beide knoppen zichtbaar', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openOptellen(page);

  const breedte = await page.evaluate(() => ({
    inhoud: document.documentElement.scrollWidth,
    scherm: document.documentElement.clientWidth,
  }));
  expect(breedte.inhoud).toBeLessThanOrEqual(breedte.scherm);

  for (const naam of ['Controleer', 'Oefening overslaan']) {
    const knop = page.getByRole('button', { name: naam });
    await expect(knop).toBeVisible();
    const vak = await knop.boundingBox();
    expect(vak!.x).toBeGreaterThanOrEqual(0);
    expect(vak!.x + vak!.width).toBeLessThanOrEqual(320);
  }
});

test('de knop Oefening overslaan staat naast Controleer', async ({ page }) => {
  await openOptellen(page);

  const controleer = await page.getByRole('button', { name: 'Controleer' }).boundingBox();
  const overslaan = await page.getByRole('button', { name: 'Oefening overslaan' }).boundingBox();
  expect(overslaan!.y).toBe(controleer!.y);
  expect(overslaan!.x).toBeGreaterThan(controleer!.x + controleer!.width);
});

test('overslaan geeft een andere som, zonder terugkoppeling en zonder antwoord', async ({
  page,
}) => {
  await openOptellen(page);
  const veld = page.getByRole('textbox');
  const overslaan = page.getByRole('button', { name: 'Oefening overslaan' });

  // Met een leeg veld.
  const eerste = await leesSom(page);
  await overslaan.click();
  const tweede = await leesSom(page);
  expect(tweede.tekst).not.toBe(eerste.tekst);
  await expect(veld).toHaveValue('');
  await expect(veld).toBeFocused();
  await expect(page.getByRole('status')).toBeEmpty();
  await expect(page.locator('main')).not.toContainText(/juist/i);

  // Met een getypt antwoord: dat verdwijnt en wordt niet beoordeeld.
  await veld.fill(tweede.juist);
  await overslaan.click();
  expect((await leesSom(page)).tekst).not.toBe(tweede.tekst);
  await expect(veld).toHaveValue('');
  await expect(veld).toBeFocused();
  await expect(page.getByRole('status')).toBeEmpty();
  await expect(page.locator('main')).not.toContainText(/juist/i);
});

test('overslaan haalt de melding over een antwoord zonder breuk weg', async ({ page }) => {
  await openOptellen(page);
  const veld = page.getByRole('textbox');
  const status = page.getByRole('status');

  const eerste = await leesSom(page);
  await veld.fill('abc');
  await veld.press('Enter');
  await expect(status).toContainText('Typ een breuk zoals 1/2.');

  await page.getByRole('button', { name: 'Oefening overslaan' }).click();
  expect((await leesSom(page)).tekst).not.toBe(eerste.tekst);
  await expect(status).toBeEmpty();
  await expect(veld).toHaveValue('');
  await expect(veld).toBeFocused();
});

test('na een controle is de knop weg, bij de volgende som staat hij er weer', async ({ page }) => {
  await openOptellen(page);
  const veld = page.getByRole('textbox');
  const overslaan = page.getByRole('button', { name: 'Oefening overslaan' });
  const volgende = page.getByRole('button', { name: 'Volgende oefening' });

  // Een melding is geen controle: dan kan de leerling nog overslaan.
  await veld.fill('abc');
  await veld.press('Enter');
  await expect(overslaan).toBeVisible();

  await veld.fill((await leesSom(page)).juist);
  await page.getByRole('button', { name: 'Controleer' }).click();
  await expect(overslaan).toBeHidden();
  await expect(volgende).toBeVisible();

  await volgende.click();
  await expect(overslaan).toBeVisible();
  await expect(volgende).toBeHidden();
});

test('Enter controleert het antwoord en slaat de oefening niet over', async ({ page }) => {
  await openOptellen(page);
  const veld = page.getByRole('textbox');
  const status = page.getByRole('status');

  const { tekst, juist } = await leesSom(page);
  await veld.fill(juist);
  await veld.press('Enter');
  await expect(status.getByText('Juist', { exact: true })).toBeVisible();
  await expect(page.locator('#opgave')).toHaveText(tekst);
  await expect(veld).toHaveValue(juist);
});

test('na het overslaan gelden de regels voor het beoordelen voor de nieuwe som', async ({
  page,
}) => {
  await openOptellen(page);
  const veld = page.getByRole('textbox');
  const status = page.getByRole('status');
  const overslaan = page.getByRole('button', { name: 'Oefening overslaan' });
  const volgende = page.getByRole('button', { name: 'Volgende oefening' });

  // Een niet-vereenvoudigd antwoord blijft fout.
  await overslaan.click();
  const eerste = await leesSom(page);
  await veld.fill(eerste.nietVereenvoudigd);
  await veld.press('Enter');
  await expect(status.getByText('Niet juist', { exact: true })).toBeVisible();
  await expect(status).toContainText(`Het juiste antwoord is ${eerste.juist}.`);
  await volgende.click();

  // Het antwoord op de overgeslagen som telt niet voor de nieuwe som, tenzij de uitkomst gelijk is.
  const tweede = await leesSom(page);
  await overslaan.click();
  const derde = await leesSom(page);
  await veld.fill(tweede.juist);
  await veld.press('Enter');
  if (tweede.juist === derde.juist) {
    await expect(status.getByText('Juist', { exact: true })).toBeVisible();
  } else {
    await expect(status.getByText('Niet juist', { exact: true })).toBeVisible();
    await expect(status).toContainText(`Het juiste antwoord is ${derde.juist}.`);
  }
  await volgende.click();

  // Het juiste antwoord op de nieuwe som is juist.
  await overslaan.click();
  await veld.fill((await leesSom(page)).juist);
  await veld.press('Enter');
  await expect(status.getByText('Juist', { exact: true })).toBeVisible();
});
