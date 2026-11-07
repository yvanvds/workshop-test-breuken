// Het gedrag van het scherm in src/components/Oefenscherm.astro, hetzelfde voor elke soort oefening.
import { beoordeel, breukAlsTekst, type Breuk } from './breuken';

export interface Oefensoort<Oefening> {
  maak: (vorige?: Oefening) => Oefening;
  alsTekst: (oefening: Oefening) => string;
  uitkomst: (oefening: Oefening) => Breuk;
  bevestiging: (oefening: Oefening, juist: string) => string;
}

export function startOefening<Oefening>(soort: Oefensoort<Oefening>) {
  const opgave = document.querySelector<HTMLElement>('#opgave')!;
  const formulier = document.querySelector<HTMLFormElement>('#formulier')!;
  const antwoord = document.querySelector<HTMLInputElement>('#antwoord')!;
  const controleer = document.querySelector<HTMLButtonElement>('#controleer')!;
  const terugkoppeling = document.querySelector<HTMLElement>('#terugkoppeling')!;
  const volgende = document.querySelector<HTMLButtonElement>('#volgende')!;

  let oefening = soort.maak();
  let beantwoord = false;

  function toonTerugkoppeling(sjabloon: string, uitleg?: string) {
    const inhoud = document
      .querySelector<HTMLTemplateElement>(sjabloon)!
      .content.cloneNode(true) as DocumentFragment;
    if (uitleg) inhoud.querySelector('[data-uitleg]')!.textContent = uitleg;
    terugkoppeling.replaceChildren(inhoud);
  }

  function toonOefening() {
    beantwoord = false;
    opgave.textContent = soort.alsTekst(oefening);
    terugkoppeling.replaceChildren();
    antwoord.value = '';
    antwoord.readOnly = false;
    controleer.hidden = false;
    volgende.hidden = true;
    antwoord.focus();
  }

  formulier.addEventListener('submit', (gebeurtenis) => {
    gebeurtenis.preventDefault();
    if (beantwoord) return;

    const uitslag = beoordeel(soort.uitkomst(oefening), antwoord.value);

    if (uitslag.soort === 'geen-breuk') {
      toonTerugkoppeling('#sjabloon-geen-breuk');
      antwoord.focus();
      return;
    }

    const juist = breukAlsTekst(uitslag.juistAntwoord);
    if (uitslag.soort === 'juist') {
      toonTerugkoppeling('#sjabloon-juist', soort.bevestiging(oefening, juist));
    } else if (uitslag.nogTeVereenvoudigen) {
      toonTerugkoppeling(
        '#sjabloon-fout',
        `Je antwoord is even groot, maar je kan het nog verder vereenvoudigen. Het juiste antwoord is ${juist}.`,
      );
    } else {
      toonTerugkoppeling('#sjabloon-fout', `Het juiste antwoord is ${juist}.`);
    }

    beantwoord = true;
    antwoord.readOnly = true;
    controleer.hidden = true;
    volgende.hidden = false;
    volgende.focus();
  });

  volgende.addEventListener('click', () => {
    oefening = soort.maak(oefening);
    toonOefening();
  });

  toonOefening();
}
