import { describe, expect, it } from 'vitest';
import {
  alleSommen,
  beoordeel,
  breukAlsTekst,
  maakSom,
  somAlsTekst,
  somUitkomst,
  type Breuk,
  type Som,
} from '../src/lib/breuken';

const GROOTSTE_GETAL = 150;

function som(a: number, b: number, c: number, d: number): Som {
  return { eerste: { teller: a, noemer: b }, tweede: { teller: c, noemer: d } };
}

const EEN_VIERDE_PLUS_EEN_VIERDE = som(1, 4, 1, 4);
const EEN_HALF: Breuk = { teller: 1, noemer: 2 };

// De tweede manier van rekenen, bewust los van de code van de app: zoek de kleinste noemer
// waarmee de som een geheel getal als teller geeft. Dat is per definitie de vereenvoudigde vorm.
function rekenNa({ eerste, tweede }: Som): Breuk {
  const boven = eerste.teller * tweede.noemer + tweede.teller * eerste.noemer;
  const onder = eerste.noemer * tweede.noemer;
  for (let noemer = 1; ; noemer++) {
    if ((boven * noemer) % onder === 0) return { teller: (boven * noemer) / onder, noemer };
  }
}

describe('een som beoordelen', () => {
  it('telt bij 1/4 + 1/4 het antwoord 1/2 als juist', () => {
    expect(beoordeel(somUitkomst(EEN_VIERDE_PLUS_EEN_VIERDE), '1/2')).toEqual({
      soort: 'juist',
      juistAntwoord: EEN_HALF,
    });
  });

  it('telt bij 1/4 + 1/4 het antwoord 2/4 als fout en geeft 1/2 als juist antwoord', () => {
    expect(beoordeel(somUitkomst(EEN_VIERDE_PLUS_EEN_VIERDE), '2/4')).toEqual({
      soort: 'fout',
      juistAntwoord: EEN_HALF,
      nogTeVereenvoudigen: true,
    });
  });

  it('telt ook de niet-vereenvoudigde vorm 8/16 als fout', () => {
    expect(beoordeel(somUitkomst(EEN_VIERDE_PLUS_EEN_VIERDE), '8/16').soort).toBe('fout');
  });

  it('rekent ongelijke noemers juist uit', () => {
    expect(beoordeel(somUitkomst(som(1, 3, 1, 6)), '1/2').soort).toBe('juist');
    expect(beoordeel(somUitkomst(som(1, 3, 1, 6)), '2/9').soort).toBe('fout');
  });

  it('telt een antwoord dat geen breuk is niet als juist of fout', () => {
    expect(beoordeel(somUitkomst(EEN_VIERDE_PLUS_EEN_VIERDE), 'abc').soort).toBe('geen-breuk');
  });

  it(
    'toont nooit een fout antwoord als juist',
    () => {
      for (let i = 0; i < 1000; i++) {
        const gegenereerd = maakSom();
        const verwacht = rekenNa(gegenereerd);
        let aantalJuist = 0;

        for (let noemer = 1; noemer <= GROOTSTE_GETAL; noemer++) {
          for (let teller = 0; teller <= GROOTSTE_GETAL; teller++) {
            const uitslag = beoordeel(somUitkomst(gegenereerd), `${teller}/${noemer}`);
            if (uitslag.soort === 'juist') aantalJuist++;
            const moetJuistZijn = teller === verwacht.teller && noemer === verwacht.noemer;
            if ((uitslag.soort === 'juist') !== moetJuistZijn) {
              expect.fail(
                `Bij ${somAlsTekst(gegenereerd)} kreeg ${teller}/${noemer} de uitslag ${uitslag.soort}`,
              );
            }
          }
        }

        // Er is precies één juist antwoord, dus de echte uitkomst telt ook echt.
        expect(aantalJuist).toBe(1);
      }
    },
    60_000,
  );

  it('geeft bij elke som hetzelfde juiste antwoord als de tweede manier van rekenen', () => {
    for (const elke of alleSommen) {
      const uitslag = beoordeel(somUitkomst(elke), '0/1');
      if (uitslag.soort !== 'fout') expect.fail(`${somAlsTekst(elke)} gaf ${uitslag.soort}`);
      expect(breukAlsTekst(uitslag.juistAntwoord)).toBe(breukAlsTekst(rekenNa(elke)));
    }
  });
});

describe('sommen', () => {
  it('hebben noemers tot 12, breuken groter dan 0 en een uitkomst kleiner dan 1', () => {
    expect(alleSommen.length).toBeGreaterThan(0);
    for (const { eerste, tweede } of alleSommen) {
      for (const { teller, noemer } of [eerste, tweede]) {
        expect(Number.isInteger(teller) && teller > 0).toBe(true);
        expect(Number.isInteger(noemer) && noemer > 0 && noemer <= 12).toBe(true);
      }
      expect(eerste.teller / eerste.noemer + tweede.teller / tweede.noemer).toBeLessThan(1);
    }
  });

  it('kunnen gelijke en ongelijke noemers hebben', () => {
    expect(alleSommen).toContainEqual(EEN_VIERDE_PLUS_EEN_VIERDE);
    expect(alleSommen).toContainEqual(som(1, 3, 1, 6));
  });

  it('komen in de praktijk voor met gelijke en met ongelijke noemers', () => {
    const noemers = new Set<boolean>();
    for (let i = 0; i < 1000; i++) {
      const { eerste, tweede } = maakSom();
      noemers.add(eerste.noemer === tweede.noemer);
    }
    expect(noemers).toEqual(new Set([true, false]));
  });

  it('komen nooit twee keer na elkaar voor, ook niet met de breuken omgewisseld', () => {
    let vorige = maakSom();
    for (let i = 0; i < 5000; i++) {
      const volgende = maakSom(vorige);
      expect(volgende).not.toEqual(vorige);
      expect(volgende).not.toEqual({ eerste: vorige.tweede, tweede: vorige.eerste });
      vorige = volgende;
    }
  });

  it('wijken ook uit als het toeval dezelfde som zou kiezen', () => {
    const eerste = alleSommen[0];
    const laatste = alleSommen[alleSommen.length - 1];
    expect(maakSom(eerste, () => 0)).not.toEqual(eerste);
    expect(maakSom(laatste, () => 0.999999)).not.toEqual(laatste);
  });

  it('blijven geldig bij het kleinste en grootste toeval', () => {
    expect(alleSommen).toContainEqual(maakSom(undefined, () => 0));
    expect(alleSommen).toContainEqual(maakSom(undefined, () => 0.999999));
  });
});
