# Mijn eerste echte project

**De website van dit project:** https://yvanvds.github.io/workshop-test-breuken/

Dit is een startpunt voor een eigen app of website die je met AI bouwt. Je hebt geen programmeerervaring nodig. De AI schrijft de code; deze template zorgt ervoor dat je project een solide basis krijgt en dat je er later zelfstandig mee verder kan.

Je krijgt:

- **skills**: kant-en-klare werkwijzen die je AI stap voor stap door de juiste keuzes en handelingen leiden
- **een design system**: een vormgeving die je AI meteen kan gebruiken, en die je later eenvoudig kan laten vervangen

Op het einde heb je je eigen project op GitHub, een ontwerpdocument en een eerste lijst taken om verder aan te werken.

## Wat heb je nodig?

- een gratis GitHub-account
- een betalend abonnement op Claude en Claude Code
- een idee voor een app of website

## Zo begin je

### 1. Maak je eigen project

Klik bovenaan deze pagina op **Use this template** en kies **Create a new repository**. Geef je project een naam. Kopieer daarna de URL van je nieuwe project.

### 2. Haal het project naar je laptop

Open Claude Code in de map waarin je wil werken en vraag:

```text
Kloon dit project naar mijn laptop: <plak hier de URL>
```

Ontbreekt er iets, zoals Git of de GitHub-tool `gh`? Dat is normaal. Vraag dan:

```text
Installeer wat er ontbreekt en help me aanmelden bij GitHub.
```

Open daarna Claude Code in de map van je project.

### 3. Maak je project duidelijk

```text
/setup
```

Je AI vraagt wat je wil maken en wat een eerste versie moet kunnen. Samen kiezen jullie een platform, bouwstenen en een manier om gegevens te bewaren. Het resultaat is het ontwerpdocument `PROJECT_OVERVIEW.md`.

### 4. Zet GitHub klaar

```text
/bootstrap-github
```

```text
/init
```

### 5. Maak een lijst taken

```text
/create-issues Kijk in PROJECT_OVERVIEW.md. Maak issues aan om de eerste versie van deze app te realiseren.
```

### 6. Laat je AI eraan werken

Gebruik de nummers die je AI bij de vorige stap teruggaf:

```text
/work-issues 1 2 3
```

Daarna kan je het resultaat bekijken, en nieuwe issues maken voor wat beter kan.

## De skills

| Skill | Wat doet ze? | Wanneer gebruik je ze? |
|---|---|---|
| `/setup` | Maakt je project duidelijk, helpt keuzes maken en schrijft `PROJECT_OVERVIEW.md`. | Eén keer, helemaal in het begin. |
| `/bootstrap-github` | Zet sjablonen en labels voor issues en pull requests klaar op GitHub. | Eén keer, na `/setup`. |
| `/create-issues` | Maakt van een paar zinnen een of meer goed omschreven taken. | Telkens als je iets wil toevoegen of als er iets fout gaat. |
| `/work-issues` | Werkt een reeks issues af, van nieuwe branch tot samenvoegen in je app. | Telkens als je AI aan je app mag werken. |
| `/work-issue` | Werkt één issue uit, inclusief testen. | Meestal niet zelf: `/work-issues` roept deze op. |
| `/cleanup` | Ruimt branches op en sluit afgewerkte issues. | Meestal niet zelf: `/work-issues` roept deze op. |
| `/discuss` | Laat je overleggen met je AI, zonder dat die iets aanpast. | Als je eerst wil nadenken. |

`/init` zit standaard in Claude Code. Het maakt een `CLAUDE.md` waarin je AI bijhoudt hoe je project in elkaar zit.

## Wat zit er in deze map?

| Map of bestand | Inhoud |
|---|---|
| `.claude/skills/` | De skills. |
| `.claude/settings.json` | Wat je AI zonder te vragen mag doen. |
| `design-system/` | De vormgeving: kleuren, lettertypes en componenten. |
| `LICENSE` | De licentie van dit project. |

## Wat mag je AI zonder te vragen?

Terwijl `/work-issues` loopt, wil je niet dat alles stilvalt omdat je AI op een toestemming wacht. Daarom bevat `.claude/settings.json` een beperkte lijst:

- **Mag zonder vragen:** bestanden in dit project aanpassen, de gewone Git- en GitHub-commando's, en de commando's om je app te installeren, te bouwen en te testen.
- **Mag nooit:** de geschiedenis op GitHub overschrijven (`git push --force`), niet-opgeslagen werk weggooien (`git reset --hard`, `git clean`) of je repo verwijderen.
- **Al de rest:** daarvoor vraagt je AI eerst toestemming.

Claude Code vraagt de eerste keer of je deze map vertrouwt. Antwoord **ja**, anders gelden deze instellingen niet. Dat zijn ook de enige instellingen die je moet kennen: de lijst pas je aan door het je AI te vragen.

## Goed om te weten

- **Er gaat regelmatig iets mis, en dat is geen probleem.** Blijf praten met je AI en zoek samen naar een oplossing.
- **Bewaar geen leerlinggegevens in een publiek project.** Namen, punten en andere persoonsgegevens horen niet in een publieke repo of op een publieke site.
