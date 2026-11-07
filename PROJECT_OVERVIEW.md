# Breuken oefenen

## Doel
Een oefenwebsite waarop leerlingen thuis breuken leren vereenvoudigen en optellen, en meteen zien of hun antwoord juist is.

## Doelgroep
Leerlingen van het eerste jaar die dit in de wiskundeles leren. Hun leerkracht deelt de link.

## Eerste versie
- De leerling kiest **vereenvoudigen** of **optellen**.
- De app toont een willekeurige oefening, en de leerling typt het antwoord.
- De app zegt meteen of het antwoord juist is, en toont anders het juiste antwoord.
- Daarna volgt de volgende oefening.

## Nog niet
- Aanmelden
- Punten bijhouden voor de leerkracht
- Moeilijkheidsgraden
- Aftrekken, vermenigvuldigen en delen

## Platform
Een website. Leerlingen hoeven zo niets te installeren: ze openen een link op hun computer, tablet of gsm.

## Frameworks en bouwstenen
Astro. Dat past bij een statische website met een interactieve oefening, en zo'n site kan gratis op GitHub Pages staan.

## Opslag
Niets bewaren. Voor losse oefeningen is dat niet nodig: alles is weg als de pagina gesloten wordt, en dat is geen probleem.

De repo en de site zijn publiek. Namen, punten en andere gegevens over leerlingen horen hier dus niet thuis, ook niet als voorbeeld.

## Vormgeving
Gebruikt het design system in `design-system/`.

## Testen
- Bij optellen moet het antwoord vereenvoudigd zijn, anders telt het niet.
- De app mag nooit een fout antwoord als juist tonen.

## Publicatie
Via GitHub Pages. De leerkracht deelt de link met de leerlingen: https://yvanvds.github.io/workshop-test-breuken/
