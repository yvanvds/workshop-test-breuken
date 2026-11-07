// De rekenregels, los van de pagina. Zo kunnen ze apart getest worden en kan het optellen ze hergebruiken.

export interface Breuk {
  teller: number;
  noemer: number;
}

export type Beoordeling =
  | { soort: 'geen-breuk' }
  | { soort: 'juist'; juistAntwoord: Breuk }
  | { soort: 'fout'; juistAntwoord: Breuk; nogTeVereenvoudigen: boolean };

const GROOTSTE_NOEMER = 60;

function grootsteGemeneDeler(a: number, b: number): number {
  return b === 0 ? a : grootsteGemeneDeler(b, a % b);
}

export function vereenvoudig({ teller, noemer }: Breuk): Breuk {
  const deler = grootsteGemeneDeler(teller, noemer);
  return { teller: teller / deler, noemer: noemer / deler };
}

export function breukAlsTekst({ teller, noemer }: Breuk): string {
  return `${teller}/${noemer}`;
}

function zijnGelijk(a: Breuk, b: Breuk): boolean {
  return a.teller === b.teller && a.noemer === b.noemer;
}

// Geeft null terug als de tekst geen breuk is, zoals leeg, abc, 1/0, 1,5/3 of -1/2.
export function leesBreuk(tekst: string): Breuk | null {
  const delen = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(tekst);
  if (!delen) return null;

  const teller = Number(delen[1]);
  const noemer = Number(delen[2]);
  // Te grote getallen kan de computer niet exact bewaren, dus daar mag niet mee gerekend worden.
  if (!Number.isSafeInteger(teller) || !Number.isSafeInteger(noemer)) return null;
  if (noemer === 0) return null;

  return { teller, noemer };
}

// Een antwoord telt alleen als het exact de volledig vereenvoudigde uitkomst is.
export function beoordeel(uitkomst: Breuk, invoer: string): Beoordeling {
  const antwoord = leesBreuk(invoer);
  if (!antwoord) return { soort: 'geen-breuk' };

  const juistAntwoord = vereenvoudig(uitkomst);
  if (zijnGelijk(antwoord, juistAntwoord)) return { soort: 'juist', juistAntwoord };

  return {
    soort: 'fout',
    juistAntwoord,
    nogTeVereenvoudigen: zijnGelijk(vereenvoudig(antwoord), juistAntwoord),
  };
}

function maakAlleOefeningen(): Breuk[] {
  const oefeningen: Breuk[] = [];
  for (let noemer = 2; noemer <= GROOTSTE_NOEMER; noemer++) {
    for (let teller = 1; teller < noemer; teller++) {
      if (grootsteGemeneDeler(teller, noemer) > 1) oefeningen.push({ teller, noemer });
    }
  }
  return oefeningen;
}

// Elke breuk kleiner dan 1 met een noemer tot en met 60 die vereenvoudigd kan worden.
export const alleOefeningen: readonly Breuk[] = maakAlleOefeningen();

// Kiest een willekeurige oefening, nooit dezelfde als de vorige.
export function maakOefening(vorige?: Breuk, kans: () => number = Math.random): Breuk {
  const keuzes = alleOefeningen.filter((oefening) => !vorige || !zijnGelijk(oefening, vorige));
  return keuzes[Math.floor(kans() * keuzes.length)];
}
