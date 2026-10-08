---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: []
---

# Landingpage lemovisports.de (v2.0)

## Scope

Startseite `site/index.html`. Besuchermodus: Persuade. Ziel: Probetraining-Anfrage
(mailto-Planer, Telefon als zweiter Weg).

## Audience, job, proof

Erwachsene aus Greven/Münsterland, Einsteiger bis Fortgeschrittene, abends am Handy.
Sie wollen wissen: Was gibt es (Reformer, Gym, Kurse), ist das was für mich, was
kostet es, wie fange ich an. Beweis: echte Fotos des Ortes, echte Preise, Kurs-Expertise
seit 2010. KI-Motive nur ergänzend und gekennzeichnet. Keine erfundenen Bewertungen
oder Zahlen.

## Pinned by the user

- Leitfrage „Was bewegt dich?“
- Studio (Reformer), Gym und Kurse kommen beim Scrollen nacheinander ins Bild (Stapel).

## Direction contract

THESIS: Die Seite ist eine Bewegungsstudie nach Muybridge und Marey. Lemovi wird Bild
für Bild über einem Messraster gezeigt, und das Scrollen ist die Zeitachse. Sie verweigert
den Kategorie-Standard (Athletenfoto vollflächig, Versal-Headline, Kartenreihe) und den
v1-Look aus Glas, Creme und kursiver Serife.

OWN-WORLD: Graphit-Backdrop mit kreidefeinem Zahlenraster. Kreideweißer Satz. Echte Fotos
als nummerierte Frames in Tafeln, zunächst monochrom, Vollfarbe nur im Moment der
Belichtung. Drei Weltfarben aus den echten Räumen, die sich nie mischen: Flieder für
Reformer, Amber für Gym, Grün für Kurse. Lemovi-Rot nur für Bewegungsspur und
Hauptaktion. Display in breitenvariabler Grotesk (Anybody), Text in Archivo. Der Ort
erscheint als Kontaktbogen auf Barytpapier mit roten Fettstift-Markierungen.

STORY: Der Besucher sieht die Frage, wählt seine Bewegung, sieht die drei Welten
nacheinander als Tafeln mit Preisen und erkennt den echten Ort. Er versteht, dass jedes
Tempo richtig ist und Begleitung dazugehört, und schickt eine Probetraining-Anfrage.

FIRST VIEWPORT: Messraster mit Randziffern. Links groß „Was / bewegt / dich?“, wobei
„bewegt“ als Mehrfachbelichtung schmal bis breit läuft (frühere Belichtungen als
Silhouetten-Scheiben mit roten Zeitmarken). Rechts daneben ein Satz zu Angebot und Ort,
dann die Arbeitsform: drei Wahlschalter (Reformer, Gym, Kurse) und der rote Button
„Probetraining anfragen“; unter 1100 px rutscht dieser Block unter die Headline. Grund für
die Seitenspalte: Bei 1440×900 bleiben Hauptaktion und Bildleiste so im ersten Bildschirm
(Persuade: Aktion sichtbar). Am unteren Rand eine randlose Bildleiste mit acht echten,
nummerierten Frames, die sich einmal von s/w zu Farbe entwickeln. Die Auswahl isoliert die
passenden Frames.

FORM: Chronofotografische Tafel (Bewegungsstudie), Platz 7 meiner nach Resonanz
geordneten Liste, Seed-Key 4fc4f594. Raises: Isolieren statt Aufzählen (Ereignisanzeige).
Farben mischen sich nie (Ebru). Vollfarbe nur im Moment (Broadcast-Alarm). Zustände als
Belichtung (Siebdruck). Eine durchgehende rote Spur (Provenienz-Band). Text in Bahnen
(Lehmturm).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction and motion grammar

Belichtung: Frames entwickeln sich von monochrom zu Farbe, wenn sie „im Moment“ sind
(Hero-Lauf einmalig, Stapel scrollgekoppelt, Kontaktbogen bei Fokus). Die Headline feuert
als Stroboskop-Mehrfachbelichtung. Rote Spuren zeichnen sich beim Scrollen (12 Wochen,
Einstieg). Eine Easing-Familie (exponentielles Ease-out). Bei reduzierter Bewegung ist alles
statisch und vollständig sichtbar.

## Unresolved

- Ein echter kurzer Bewegungsclip aus dem Studio würde die Tafeln vollenden (nicht vorhanden).
