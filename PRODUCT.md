# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Erwachsene aus Greven und dem Münsterland, die (wieder) mit Training anfangen
oder einen ruhigeren, persönlicheren Ort als eine Fitnesskette suchen:
Einsteiger, Wiedereinsteiger und Fortgeschrittene. Typische Situation: abends
am Smartphone, oft nach einem Instagram-Beitrag, mit der Frage „Ist das was
für mich, was kostet es und wie fange ich an?“

## Product Purpose

Lemovi Sports ist ein Boutique-Studio in Greven mit drei Wegen in Bewegung
unter einem Dach: Reformer Pilates, ein ruhiges Boutique-Gym und
energiegeladene Gruppenkurse, ergänzt um Personal Coaching und ein
12-Wochen-Programm. Die Landingpage soll Interessierte zu einer
Probetraining-Anfrage führen. Erfolg = eine gesendete Anfrage
(E-Mail oder Anruf).

## Positioning

Drei Bewegungswelten unter einem Dach, kombinierbar und persönlich begleitet,
statt eines Einzweck-Studios oder anonymen Massenbetriebs. Kurs-Expertise seit
2010. Einstieg auf jedem Level, flexible Wege (Abo, 5er-/10er-Pass, Single
Session, Probewoche).

## Operating Context

- Probetraining: persönliche Einweisung durch Trainer, maßgeschneidertes
  Bewegungsprogramm, Vorstellung der Geräte.
- Kursplätze buchen Mitglieder nach Verfügbarkeit über die App.
- Kurse: Jumping, Step-Aerobic, Enorm in Form, Power Pump; Aquacycling beim
  Partner treibgut.
- 12-Wochen-Programm: persönliche Begleitung, individueller Plan (Training und
  Ernährung), regelmäßige Reflexion.
- Personal Coaching: Fokus-Sitzungen zur Motivation, Fortschrittsanalyse und
  Neuausrichtung der Ziele.

## Capabilities and Constraints

- Statische Seite in `site/` (Vite + TypeScript, ohne Framework). Kein Backend.
- Die Anfrage überträgt keine Daten: Der Planer erzeugt nur einen
  `mailto:`-Link an hallo@lemovisports.de. Ohne JavaScript bleibt ein direkter
  Mail-Link.
- Externe Ziele: Kursplan, Studio, Gym, 12-Wochen-Programm, Shop, Impressum,
  Datenschutz auf lemovisports.de; Virtuagym-Webshop für Mitgliedschaften.
- Preise (laut lemovisports.de, Stand Oktober 2026): Reformer Single Pass 25 €,
  Reformer 4×/Monat inkl. Gym 74,90 €, lemovi basic 24 Monate 34,90 €/Monat,
  lemovi basic 12 Monate 39,90 €/Monat, einmalige Aufnahmegebühr 49,90 €.
  Vor jeder Veröffentlichung gegen die Live-Seite prüfen.
- Higgsfield-Integration (`index.ts`, `scripts/generate-*.ts`) ist
  serverseitig, kostenpflichtig und gehört nicht zum Build.

## Brand Commitments

- Name „Lemovi Sports“ (Logo: rotes kursives „Lemovi“, darunter „sports“ mit Schwung).
- Kontakt: 01514 6368609 · hallo@lemovisports.de · Saerbecker Str. 141, 48268 Greven.
- Ansprache per Du, warm, persönlich, ohne Leistungsdruck.
- Vom Nutzer ausdrücklich gewünscht (Oktober 2026): die Leitfrage
  „Was bewegt dich?“ und dass Studio, Gym und Kurse beim Scrollen nacheinander
  ins Bild kommen.
- Hauptaktion: „Probetraining anfragen“.

## Evidence on Hand

- Echte Fotos (Website/Projektordner): Reformer-Raum mit violettem Deckenlicht
  und Rundbogenspiegeln, Reformer-Training und -Detail (Holz-Reformer mit
  rotem Lemovi-Schriftzug), Gym mit Wandleuchten, Kursraum mit Seilspringen
  vor dem „Rebuild“-Schriftzug, Beratungsgespräch, Spiegel-Triptychon,
  Dehnung vor Backstein (s/w), Frau im Gym (Einwilligung bestätigt, Oktober 2026).
- KI-generierte Kampagnenmotive und Kampagnenfilm (Higgsfield), nur ergänzend
  und sichtbar als „KI-Motiv“ gekennzeichnet.
- Keine Kundenbewertungen, Mitgliederzahlen oder Erfolgsquoten vorhanden.
  Diese dürfen nicht erfunden werden.

## Product Principles

1. Echtes vor Inszeniertem: Der reale Ort in Greven ist der stärkste Beweis.
2. Wahl statt Druck: Der Besucher findet seine Bewegung, wir begleiten.
3. Jeder Einstieg ist richtig: Anfänger und Wiedereinsteiger fühlen sich gemeint.
4. Klarheit vor Verkauf: Preise, nächster Schritt und Kontakt sind ehrlich und sofort auffindbar.

## Accessibility & Inclusion

WCAG 2.2 AA als Ziel (Kontrast, Zielgrößen, Tastatur, `prefers-reduced-motion`,
Nutzbarkeit ohne JavaScript). Altersgemischte Zielgruppe: gut lesbare
Schriftgrößen, keine winzigen Labels.
