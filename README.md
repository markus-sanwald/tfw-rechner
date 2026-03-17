# TFW Rechner

Webbasierter Rechner für das **Freizeit-Wertguthaben (TFW)**.

## Worum geht es?

Das TFW ermöglicht es Beschäftigten, Entgeltanteile in ein persönliches Wertguthaben einzuzahlen und dieses Guthaben später für bezahlte Freizeit zu nutzen (z. B. für eine Auszeit, früheren Ruhestand oder Weiterbildung). Der TFW Rechner hilft dabei, die finanzielle Machbarkeit einer geplanten Auszeit zu prüfen: Reicht das angesammelte Guthaben, um den gewünschten Zeitraum ohne Einkommenseinbußen zu überbrücken?

## Funktionen

### Kernberechnung
- **Zeitraum** (Von/Bis) mit individuellem Datepicker (Kalender-Widget)
- Anteilige Monatsberechnung auf Basis von Arbeitstagen bei nicht-vollständigen Monaten
- **Monatliches Bruttogehalt** als Basis für alle Berechnungen
- **Aktuelles TFW-Guthaben** (optionaler Startwert)
- **Saldo-Anzeige**: Guthaben minus Gesamtgehalt während der Auszeit

### Ansparrechnung (optional)
- **Monatliche TFW-Stunden**: Berechnung des künftigen Ansparwerts bis zum Beginn der Auszeit
- **Wöchentliche Arbeitszeit** (Standard: 35 Std.) als Grundlage für den Stundensatz
- **TFW-Startmonat**: Optionale Auswahl, ab welchem Monat die mtl. TFW-Stunden eingezahlt werden (Standard: aktueller Monat). Kein Startmonat nach Beginn der Auszeit wählbar.

### Sonderzahlungen (optional)
- **Urlaubsgeld**: 69 % des Monatsentgelts (Auszahlungsmonat: Juni)
- **Weihnachtsgeld**: 55 % des Monatsentgelts (Auszahlungsmonat: November)
- **T-Zug A + B**: T-Zug A = 27,5 % des Monatsentgelts (Juli), T-Zug B = 26,5 % des ERA-Eckentgelts BW (Februar)
- Sonderzahlungen werden anteilig je nach Anzahl der anfallenden Zahlungen bis zum TFW-Start gezählt

### Ergebnisdarstellung
- Aufschlüsselung aller Einnahmen- und Ausgabenposten
- **Burndown-Chart** (SVG): Monatsweise Visualisierung des Guthabenverlaufs über den Auszeit-Zeitraum
  - Farbige Flächenbereiche: Blaue Zone (Guthaben vorhanden) / Rote Zone (Guthaben aufgebraucht)
  - **Antragsfrist-Linie**: Gestrichelte Markierung, bis wann der TFW-Antrag gestellt werden muss
  - **Hover-Tooltips** mit Monats-Detailwerten
  - **Vergrößerungsansicht** per Expand-Button (Vollbild-Modus)
- **Brutto/Netto-Toggle** für die Darstellung (progressives Lohnsteuer-Modell)
- Mehrsprachig: Deutsch / Englisch

### UI-Details
- 1.000er-Trennzeichen für Währungseingaben (Punkt als Tausendertrennzeichen, Komma als Dezimaltrennzeichen)
- Tooltips (ⓘ) mit Erklärungen zu allen relevanten Feldern
- Responsive Design

## Technischer Stack

| Technologie | Zweck |
|---|---|
| Vanilla JavaScript (ES5) | Gesamte Applikationslogik (keine Frameworks) |
| Vite | Build-Tool & Dev-Server |
| Vitest + jsdom | Unit-Tests |
| SVG | Burndown-Chart (keine externen Chart-Bibliotheken) |

## Projektstruktur

```
tfw-rechner/
├── index.html              # Einstiegspunkt (SPA via Hash-Routing)
├── impressum.html          # Impressum (statisch, für direkte URL-Aufrufe)
├── datenschutz.html        # Datenschutz (statisch, für direkte URL-Aufrufe)
├── src/
│   ├── rechner.js          # Berechnungslogik (Zeitraum, Arbeitstage, Datumshelfer)
│   ├── main.js             # UI, Komponenten, Chart, Navigation
│   ├── i18n.js             # Übersetzungen (DE/EN)
│   └── style.css           # Stylesheet
└── test/
    └── rechner.test.js     # Unit-Tests für rechner.js
```

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server starten (http://localhost:5173)
npm test           # Unit-Tests ausführen
npm run build      # Produktions-Build
```

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).
