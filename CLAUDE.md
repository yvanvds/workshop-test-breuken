# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stand van zaken

De basis staat: een Astro-project met een startpagina, de gedeelde layout `src/layouts/Layout.astro`, tests en een automatische controle op elke pull request (`.github/workflows/ci.yml`). De oefeningen staan in `src/pages/vereenvoudigen.astro` en `src/pages/optellen.astro`. Ze delen het scherm `src/components/Oefenscherm.astro` en het gedrag in `src/lib/oefenscherm.ts`. De rekenregels staan in `src/lib/breuken.ts`.

Elke push naar `main` publiceert de site op https://yvanvds.github.io/workshop-test-breuken/ via `.github/workflows/publiceren.yml`. Die workflow draait niet op een pull request; `tests/publiceren.test.ts` controleert hem wel vooraf.

`PROJECT_OVERVIEW.md` is de bron voor wat de app moet doen, wat er bewust nog niet in komt, en waarom. Lees die eerst.

De gebruiker is een leerkracht zonder programmeerervaring. Praat Nederlands, kort en zonder jargon.

## Commando's

| Wat | Commando |
|---|---|
| De app starten | `npm run dev`, daarna op `http://localhost:4321/workshop-test-breuken/` |
| Bouwen | `npm run build` |
| Alle tests voor de werking (Vitest, in `tests/` en `src/`) | `npm test` |
| Eén test voor de werking | `npx vitest run tests/config.test.ts` |
| Alle tests met de echte app (Playwright, in `e2e/`) | `npm run test:e2e` |
| Eén test met de echte app | `npx playwright test e2e/startpagina.spec.ts` |

De eerste keer op een nieuwe computer: `npm ci` en `npx playwright install chromium`.

Start een AI-agent `npm run dev`, dan draait Astro op de achtergrond verder. Stop de site daarna met `npx astro dev stop`.

## Technische basis

- **App:** Astro, statisch gepubliceerd op GitHub Pages. De repo is `yvanvds/workshop-test-breuken`, dus de site komt onder het subpad `/workshop-test-breuken/`. Zet `site` en `base` in de Astro-configuratie en laat links en bestanden daarmee rekening houden.
- **Tests:** Vitest voor de werking, Playwright voor de echte app. Dit is de keuze uit `.claude/skills/work-issue/SKILL.md`.
- **Opslag:** geen. Geen backend, geen browsergeheugen en geen leerlinggegevens: de repo en de site zijn publiek.

## Werkwijze

Wijzigingen verlopen via GitHub-issues en de skills in `.claude/skills/`:

- `/create-issues` maakt issues aan.
- `/work-issues` werkt een reeks issues af, van branch tot merge. Die skill roept `work-issue` en `cleanup` op.
- `/work-issue` volgt ook de volgorde van de controles: opmaak, linter, tests voor de werking, tests met de echte app, build.

`.claude/settings.json` bepaalt wat zonder toestemming mag. Force-push, `git reset --hard`, `git clean` en `gh repo delete` zijn geblokkeerd.

De sjablonen in `.github/` zijn een kopie van `.claude/skills/bootstrap-github/templates/`. `.github/workflows/ci.yml` hoort bij dit project.

## Vormgeving

`design-system/README.md` is de bron voor alle regels over kleur, contrast, typografie en het gebruik in Astro. Dit is wat het meest telt voor deze app:

- Gebruik de tokens uit `tokens.css`, nooit losse kleurcodes. De componenten zijn gewone HTML met `ai-`-klassen, zonder React. `bundle.js` koppelt het gedrag via data-attributen. Roep `window.ArcadiaAI.init(element)` op voor inhoud die later wordt toegevoegd, zoals een nieuwe oefening.
- Het design system is gemaakt voor AI-modules, en deze app gaat niet over AI. Teal (`ai*`) en de barometerkleuren (`level-*`) horen hier dus niet, en ook de AI-componenten niet. Gebruik groen (`brand`, `brand-text`, `forest`).
- Toon juist of fout nooit met kleur alleen, maar altijd met een icoon (✓ / ✕) én een woord. Gebruik `success` op `success-soft` en `danger` op `danger-soft`.
- `brand` is nooit tekst op een lichte achtergrond. Gebruik daarvoor `brand-text`.

## Regels die de tests moeten bewaken

Dit komt uit `PROJECT_OVERVIEW.md` en is het belangrijkste gedrag van de app:

- Bij optellen telt een antwoord alleen als het vereenvoudigd is. Is de uitkomst 1/2, dan is 2/4 fout.
- De app mag nooit een fout antwoord als juist tonen.
