import { describe, expect, it } from 'vitest';
import {
  alleOefeningen,
  beoordeel,
  breukAlsTekst,
  leesBreuk,
  maakOefening,
  vereenvoudig,
  type Breuk,
} from '../src/lib/breuken';

const VIER_ACHTSTEN: Breuk = { teller: 4, noemer: 8 };
const EEN_HALF: Breuk = { teller: 1, noemer: 2 };

// Staat bewust los van de code van de app: zo controleert deze test de app echt.
function isEchteUitkomst(teller: number, noemer: number, oefening: Breuk): boolean {
  if (teller * oefening.noemer !== noemer * oefening.teller) return false;
  for (let deler = 2; deler <= Math.min(teller, noemer); deler++) {
    if (teller % deler === 0 && noemer % deler === 0) return false;
  }
  return true;
}

describe('beoordeel', () => {
  it('telt bij 4/8 het antwoord 1/2 als juist', () => {
    expect(beoordeel(VIER_ACHTSTEN, '1/2')).toEqual({ soort: 'juist', juistAntwoord: EEN_HALF });
  });

  it('telt bij 4/8 het antwoord 2/4 als fout en geeft 1/2 als juist antwoord', () => {
    expect(beoordeel(VIER_ACHTSTEN, '2/4')).toEqual({
      soort: 'fout',
      juistAntwoord: EEN_HALF,
      nogTeVereenvoudigen: true,
    });
  });

  it('telt de oefening zelf niet als juist antwoord', () => {
    expect(beoordeel(VIER_ACHTSTEN, '4/8').soort).toBe('fout');
  });

  it('zegt niet dat een antwoord met een andere waarde nog te vereenvoudigen is', () => {
    expect(beoordeel(VIER_ACHTSTEN, '1/3')).toEqual({
      soort: 'fout',
      juistAntwoord: EEN_HALF,
      nogTeVereenvoudigen: false,
    });
  });

  it('telt 0/5 als fout', () => {
    expect(beoordeel(VIER_ACHTSTEN, '0/5').soort).toBe('fout');
  });

  it.each(['', '   ', 'abc', '1/0', '0/0', '1,5/3', '1.5/3', '-1/2', '1/-2', '1', '1/2/3', '1 2/3'])(
    'telt "%s" niet als juist of fout',
    (invoer) => {
      expect(beoordeel(VIER_ACHTSTEN, invoer)).toEqual({ soort: 'geen-breuk' });
    },
  );

  it.each([' 1 / 2 ', '1 /2', '1/ 2', '\t1/2\n'])('negeert de spaties in "%s"', (invoer) => {
    expect(beoordeel(VIER_ACHTSTEN, invoer).soort).toBe('juist');
  });

  it('toont nooit een fout antwoord als juist', () => {
    for (let i = 0; i < 1000; i++) {
      const oefening = maakOefening();
      let aantalJuist = 0;

      for (let noemer = 1; noemer <= 60; noemer++) {
        for (let teller = 1; teller <= 60; teller++) {
          const uitslag = beoordeel(oefening, `${teller}/${noemer}`);
          const verwacht = isEchteUitkomst(teller, noemer, oefening);
          if (uitslag.soort === 'juist') aantalJuist++;
          if ((uitslag.soort === 'juist') !== verwacht) {
            expect.fail(
              `Bij ${breukAlsTekst(oefening)} kreeg ${teller}/${noemer} de uitslag ${uitslag.soort}`,
            );
          }
        }
      }

      // Er is precies één juist antwoord, dus de echte uitkomst telt ook echt.
      expect(aantalJuist).toBe(1);
    }
  });
});

describe('leesBreuk', () => {
  it('leest teller en noemer', () => {
    expect(leesBreuk('3/7')).toEqual({ teller: 3, noemer: 7 });
  });

  it('weigert getallen die te groot zijn om exact te bewaren', () => {
    expect(leesBreuk('1/99999999999999999999')).toBeNull();
  });
});

describe('vereenvoudig', () => {
  it('vereenvoudigt volledig', () => {
    expect(vereenvoudig({ teller: 12, noemer: 60 })).toEqual({ teller: 1, noemer: 5 });
  });
});

describe('oefeningen', () => {
  it('kunnen allemaal vereenvoudigd worden, zijn kleiner dan 1 en hebben een noemer tot 60', () => {
    expect(alleOefeningen.length).toBeGreaterThan(0);
    for (const { teller, noemer } of alleOefeningen) {
      expect(Number.isInteger(teller) && teller > 0).toBe(true);
      expect(Number.isInteger(noemer) && noemer <= 60).toBe(true);
      expect(teller).toBeLessThan(noemer);
      expect(vereenvoudig({ teller, noemer }).noemer).toBeLessThan(noemer);
    }
  });

  it('bevatten 4/8', () => {
    expect(alleOefeningen).toContainEqual(VIER_ACHTSTEN);
  });

  it('komen nooit twee keer na elkaar voor', () => {
    let vorige = maakOefening();
    for (let i = 0; i < 5000; i++) {
      const volgende = maakOefening(vorige);
      expect(volgende).not.toEqual(vorige);
      vorige = volgende;
    }
  });

  it('wijken ook uit als het toeval dezelfde oefening zou kiezen', () => {
    const eerste = alleOefeningen[0];
    const laatste = alleOefeningen[alleOefeningen.length - 1];
    expect(maakOefening(eerste, () => 0)).not.toEqual(eerste);
    expect(maakOefening(laatste, () => 0.999999)).not.toEqual(laatste);
  });

  it('blijven geldig bij het kleinste en grootste toeval', () => {
    expect(alleOefeningen).toContainEqual(maakOefening(undefined, () => 0));
    expect(alleOefeningen).toContainEqual(maakOefening(undefined, () => 0.999999));
  });
});
