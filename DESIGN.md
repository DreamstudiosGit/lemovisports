---
name: Lemovi Sports
description: Landingpage als Bewegungsstudie – echte Frames über einem Messraster, Scrollen ist die Zeitachse.
colors:
  graphite: "#1a191c"
  graphite-plate: "#232226"
  graphite-raised: "#2e2d32"
  chalk: "#eeebe4"
  chalk-soft: "#bdb8ae"
  chalk-muted: "#918c84"
  baryta: "#f1f0eb"
  baryta-shade: "#e4e2db"
  ink: "#141317"
  ink-soft: "#4d4a52"
  film-black: "#0d0c0f"
  lemovi-red: "#e84048"
  action-red: "#d32f3a"
  action-red-deep: "#a91f2a"
  reformer-lilac: "#b7a1ef"
  gym-amber: "#efb049"
  course-green: "#57cf8c"
typography:
  display:
    fontFamily: "Anybody, 'Arial Narrow', system-ui, sans-serif"
    fontSize: "min(6rem, 14vw)"
    fontWeight: 800
    lineHeight: 0.88
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Anybody, 'Arial Narrow', system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 1.3rem + 3.9vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Anybody, 'Arial Narrow', system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 0.9rem + 0.9vw, 1.6rem)"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 118"
  body:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Anybody, 'Arial Narrow', system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 120"
  price:
    fontFamily: "Anybody, 'Arial Narrow', system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 0.9vw, 2rem)"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum' 1, 'lnum' 1"
rounded:
  none: "0px"
  sm: "2px"
spacing:
  grid-module: "clamp(40px, 4.4vw, 64px)"
  gutter: "clamp(16px, 4vw, 56px)"
  section: "clamp(88px, 11vw, 168px)"
  plate-bar: "52px"
components:
  button-primary:
    backgroundColor: "{colors.action-red}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.action-red-deep}"
    textColor: "#ffffff"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
  pick-chip:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 16px"
  record-chip-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.baryta}"
    rounded: "{rounded.sm}"
    height: "44px"
  plate:
    backgroundColor: "{colors.graphite-plate}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
  record:
    backgroundColor: "{colors.baryta}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "clamp(22px, 3vw, 40px)"
---

# Design System: Lemovi Sports

## Overview

**Creative North Star: "Die Bewegungsstudie"**

Die Seite behandelt Lemovi wie eine chronofotografische Studie nach Muybridge und Marey: Ein Graphit-Hintergrund mit kreidefeinem Messraster ist die Wand, vor der alles stattfindet, und echte Fotos aus Greven sind nummerierte Frames auf dieser Wand. Scrollen ist die Zeitachse. Frames liegen zunächst als Silbergelatine (monochrom) da und entwickeln sich in Farbe, sobald sie „im Moment“ sind. Was zurücktritt, fällt wieder ins Grau.

Die Dichte wechselt bewusst: dichte Tafeln (Stapel der drei Welten, 12-Wochen-Platte) wechseln mit ruhigen Flächen auf Barytpapier (Kontaktbogen, Einstieg). Ornament gibt es nicht; jedes grafische Element ist ein Messwerkzeug der Studie: Raster, Randziffern, Frame-Nummern, rote Zeitmarken und Bewegungsspuren.

Abgelehnt sind ausdrücklich der Kategorie-Standard (Athletenfoto vollflächig, Versal-Headline, Kartenreihe) und der Vorgänger-Look aus Glas, Creme und kursiver Serife.

**Key Characteristics:**
- Graphit-Backdrop mit sichtbarem Messraster und Randziffern
- Echte Fotos als nummerierte Frames, monochrom bis zur Belichtung
- Breitenvariable Display-Schrift: Breite drückt Bewegung aus
- Drei Weltfarben aus den echten Räumen, die sich nie mischen
- Lemovi-Rot nur für Bewegungsspuren, Fettstift und die Hauptaktion
- Rechteckige Formen, Haarlinien statt Schatten-Karten

## Colors

Neutrales Graphit und Kreide tragen die Fläche; Farbe kommt aus den echten Räumen des Studios und aus dem Logo.

### Primary
- **Lemovi-Rot** (lemovi-red): Bewegungsspuren (Zeitmarken unter „bewegt“, 12-Wochen-Linie, Einstiegsspur) und der rote Fettstift im Kontaktbogen. Aus dem Logo gemessen.
- **Aktionsrot** (action-red / action-red-deep): ausschließlich Hauptaktionen (Probetraining anfragen, „… ausprobieren“, Anfrage öffnen) und die Phasenziffern auf der Einstiegsspur. Die tiefere Stufe ist der Hover-Verschluss.

### Secondary
- **Reformer-Flieder** (reformer-lilac): das violette Deckenlicht des Reformer-Raums. Nur in der Reformer-Welt (Swatch, Tag-Marker, Preise).
- **Gym-Amber** (gym-amber): die Wandleuchten im Gym. Nur in der Gym-Welt.
- **Kurs-Grün** (course-green): das Springseil im Kursraum. Nur in der Kurs-Welt.

### Neutral
- **Graphit** (graphite): Seitengrund und Backdrop-Raster. **Tafelgraphit** (graphite-plate): Tafeln, 12-Wochen-Fläche. **Graphit hell** (graphite-raised): Platzhalter hinter Frames.
- **Kreide** (chalk), **Kreide weich** (chalk-soft), **Kreide matt** (chalk-muted): Text in drei Stufen; matt ist die Untergrenze für Fließtext (≥ 4,5 : 1 auf Graphit und Tafelgraphit).
- **Barytpapier** (baryta) und **Papierschatten** (baryta-shade): helle Flächen (Kontaktbogen, Einstieg, Anfrage-Protokoll) mit **Tinte** (ink) und **Tinte weich** (ink-soft).
- **Filmschwarz** (film-black): Filmstreifen im Kontaktbogen.

### Named Rules
**The No-Mix Rule.** Jede Welt besitzt genau eine Farbe. Flieder, Amber und Grün erscheinen nie gemeinsam in einem Element; neutrale Elemente (Erstgespräch, Formular-Chips ohne Welt) bleiben kreide- oder tintenfarben.

**The Red-Means-Motion Rule.** Rot steht nur für Bewegung (Spur, Zeitmarke, Fettstift) oder Handlung (Hauptaktion). Navigation, Fokus und Auswahlzustände sind kreideweiß bzw. tintenfarben.

**The Exposure Rule.** Vollfarbe hat ein Foto nur im Moment: in der Hero-Bildleiste nach der Belichtung, auf der obersten Tafel, auf den markierten Kontaktbogen-Frames und unter dem Cursor. Verdeckte oder nicht gewählte Frames fallen in Graustufen zurück.

## Typography

**Display Font:** Anybody (mit 'Arial Narrow', system-ui)
**Body Font:** Archivo (mit system-ui)

**Character:** Anybody liefert jede Breite von 50 % bis 150 %; schmal und schwer stellt Fragen, breit benennt Welten. Archivo bleibt ruhig und lesbar darunter.

### Hierarchy
- **Display** (800, min(6rem, 14vw), 0.88, Breite 62 %): nur die Hero-Frage. „bewegt“ läuft als Mehrfachbelichtung von 55 % bis 125 % Breite.
- **Headline** (800, clamp(2.4rem → 4.75rem), 0.92, Breite 72 %): Abschnittstitel; „Deine Studie beginnt hier.“ bis 6rem.
- **Title** (800, clamp(1.15rem → 1.6rem), Breite 118 %): Tafel-Titel in den Stapel-Reitern, breit wie Plattenbeschriftung.
- **Body** (400, 1.0625rem, 1.6): Fließtext, Messbreite ≤ 34rem in Spalten.
- **Label** (600, 0.72rem, 0.08em, Versalien, Breite 120 %): Frame-Nummern, Frame-Beschriftungen, Footer-Labels.
- **Price** (700, clamp(1.5rem → 2rem), tabellarische Ziffern): Preise in der Weltfarbe.

### Named Rules
**The Width-Is-Motion Rule.** Betonung entsteht durch Breite und Gewicht, nie durch Kursive, Farbverlauf oder zusätzliche Schriften. Die 12 Wochen wachsen in Breite (50 % → 138 %) und Gewicht (300 → 850).

**The No-Kicker Rule.** Über Überschriften stehen keine Labels oder Abschnittsnummern. Nummern gibt es nur dort, wo sie Frames oder Schritte zählen.

## Layout

Raster-Modul `grid-module` (40–64 px) als sichtbare Hintergrundlinien, links bündig ab 0; Inhalte in einer Shell von max. 1320 px mit fluidem `gutter`. Abschnitte atmen mit `section` (88–168 px). Zweispaltige Köpfe (Titel links 1.3fr, Erläuterung rechts 1fr, unten bündig) wiederholen sich in jedem dunklen Abschnitt.

Hero: Randziffern-Leiste, Frage links, Arbeitsform rechts (unter 1100 px darunter), randlose Bildleiste mit acht 3:4-Frames (unter 760 px horizontal scrollbar mit Snap). Studien: drei Tafeln, jede `position: sticky` eine Reiterhöhe (`plate-bar`) tiefer als die vorige; Tafelhöhe `min(100svh − Header − 3 Reiter − 28px, 760px)`; auf Telefonen hebt das Skript eine zu hohe Tafel an, damit ihr Ende erreichbar bleibt. 12 Wochen: 12 Frames in einer Reihe, unter 900 px 6 × 2. Tempo: 5 Frames, unter 900 px horizontaler Snap-Streifen.

## Elevation & Depth

Flach mit Haarlinien. Tiefe entsteht durch Überdeckung: Tafeln schieben sich übereinander, die verdeckte Tafel skaliert minimal (bis 0,955), verdunkelt sich über eine Graphit-Ebene (bis 58 %) und fällt in Graustufen.

### Shadow Vocabulary
- **Plate lift** (`box-shadow: 0 -18px 40px -22px rgb(0 0 0 / 0.75)`): Kante einer Tafel, die über die vorige gleitet.
- **Record lift** (`box-shadow: 0 34px 70px -34px rgb(0 0 0 / 0.85)`): das Anfrage-Protokoll auf Papier über dem Graphit.

### Named Rules
**The Overlap-Not-Float Rule.** Schatten gibt es nur, wo ein Blatt wirklich über einem anderen liegt. Keine schwebenden Karten, kein Glas.

## Shapes

Rechteckig wie Fotoplatten: Tafeln und Frames 0 px, Buttons, Chips und das Protokoll 2 px. Trennungen sind 1-px-Haarlinien (Kreide 16 %, auf Papier Tinte 16 %); Rasterzellen entstehen über 1-px-Lücken auf Linienfarbe. Runde Formen gibt es nur als Zeitmarken (Punkte) und als handgezogene Fettstift-Schleifen.

## Components

### Buttons
- **Shape:** fast eckig (2 px)
- **Primary:** Aktionsrot, Weiß, 48 px hoch (56 px groß), Archivo 600
- **Hover / Focus:** ein tieferes Rot schließt von links wie ein Verschluss (clip-path, 0,5 s); Pfeil rückt 4 px vor; Fokus 2 px Kreide-Outline mit 3 px Abstand
- **Ghost:** transparent, 1-px-Kreidelinie 34 %, Hover volle Kreide

### Chips
- **Wahlschalter (Hero):** transparent, Haarlinie, Weltfarben-Swatch; gedrückt mit Weltfarbe als Rand und 16 % Fläche. Sie isolieren die Frames ihrer Welt und schreiben sich in die Anfrage.
- **Protokoll-Chips (Papier):** Haarlinie in Tinte, Kästchen mit gezeichnetem Haken; angehakt Tinte auf Papier, Welt-Chips zusätzlich mit 4-px-Unterkante in Weltfarbe.

### Cards / Containers
- **Tafel:** Tafelgraphit mit eigenem Raster, Reiter (52 px) mit breitem Titel und Tempo-Swatch, Körper als Zellen (Hauptfoto, zwei Nebenframes, Text/Preise/Aktionen).
- **Protokoll:** Barytpapier, 2-px-Tintenlinie unter dem Kopf, Vorschau auf Papierschatten.

### Inputs / Fields
- **Style:** nur Unterlinie (1,5 px Tinte), 48 px hoch, 1.1rem
- **Focus:** Unterlinie wird Aktionsrot

### Navigation
- Text-Links in Kreide weich, aktiv in Kreide mit zwei Sucher-Winkeln (6 px, Kreide) an den oberen Ecken. Header transparent über dem Raster, beim Scrollen Graphit mit Haarlinie. Unter 1081 px Vollbild-Menü auf Raster mit breiten Anybody-Links; mobile Sticky-Leiste mit Hauptaktion und Anruf.

### Bewegungsstudie (Signature)
- **Mehrfachbelichtung:** „bewegt“ mit vier früheren Belichtungen als halbtransparente Silhouetten-Scheiben und roten Zeitmarken; beim Laden fährt das Wort von schmal nach breit über die Marken.
- **Frames:** Foto in Rahmen mit Frame-Nummer oben links und Beschriftung unten links (Label auf Graphit); entwickeln sich von Graustufen in Farbe.
- **Spuren:** SVG-Linien mit nicht skalierender Strichstärke; ihre Länge wird gemessen (`--k`), damit sie scrollgekoppelt exakt bis zum Ende zeichnen.
- **Kontaktbogen:** Filmstreifen in Filmschwarz mit Perforation und Randdruck auf Barytpapier; nur die mit rotem Fettstift markierten Frames sind farbig.

## Do's and Don'ts

### Do:
- **Do** echte Fotos aus Greven als nummerierte Frames zeigen; KI-Motive nur ergänzend mit sichtbarem „KI-Motiv“-Label.
- **Do** Farbe als Belichtung einsetzen: monochrom → Farbe im Moment, zurück in Grau beim Verdecken.
- **Do** Breite der Anybody als Betonung nutzen (schmal = Frage, breit = Name).
- **Do** jede neue Fläche mit Haarlinien und Rasterzellen gliedern, nicht mit Karten.
- **Do** bei `prefers-reduced-motion` alles farbig, gezeichnet und still zeigen.

### Don't:
- **Don't** Weltfarben mischen oder Rot für Navigation, Fokus oder Dekoration verwenden.
- **Don't** Labels, Kicker oder Abschnittsnummern über Überschriften setzen.
- **Don't** Glas, Unschärfe-Flächen, Verlaufstext oder kursive Akzentschriften einsetzen.
- **Don't** Fotos dauerhaft in Graustufen ausliefern, wenn JavaScript fehlt: Der Ausgangszustand ist immer farbig.
- **Don't** Bewertungen, Zahlen oder Leistungsversprechen erfinden.
