# Lemovi Sports — Landingpage v2.0 „Bewegungsstudie“

Die Startseite liegt in `site/` (Vite + TypeScript, ohne Framework). Version 2.0
ist ein vollständiger Neuentwurf, erarbeitet mit dem Design-Skill
[pbakaus/impeccable](https://github.com/pbakaus/impeccable): Produktwahrheit in
`PRODUCT.md`, Richtungsvertrag in `.impeccable/surfaces/site-index-html.md`,
Designsystem in `DESIGN.md` (+ `.impeccable/design.json`). Es wurde nichts live
veröffentlicht.

## Vorschau, Build und Prüfung

```powershell
npm.cmd run dev            # http://127.0.0.1:5173/ (nur lokal gebunden)
npm.cmd run typecheck
npm.cmd run build          # prüft TypeScript, erstellt dist/
npm.cmd run preview        # http://127.0.0.1:4173/ (Produktions-Build)
npm.cmd run check:browser  # 17 Browserprüfungen; PREVIEW_URL=… für den Build
```

`check:browser` nutzt das installierte Google Chrome über Playwright und legt
Screenshots sowie `report.json` unter `.local/browser/` ab. Geprüft werden Layout
und Medien bei 320–1920 px, axe (WCAG 2.2 AA) auf Mobile und Desktop,
Zielgrößen, Menü mit Fokusfalle, Abschnittsmarkierung, Wahlschalter ↔ Anfrage,
Anfrage-Protokoll (mailto), Belichtung/Stapel/Spuren, Stapel auf Telefonen,
Sticky-Leiste, Nutzung ohne JavaScript, `prefers-reduced-motion` und
Zugriffsschutz für Servercode.

## Idee

Die Seite ist eine **Bewegungsstudie** nach Muybridge und Marey: Ein
Graphit-Hintergrund mit Messraster ist die Wand, echte Fotos aus Greven sind
nummerierte Frames davor, und Scrollen ist die Zeitachse. Fotos liegen zunächst
monochrom da und entwickeln sich in Farbe, sobald sie „im Moment“ sind.

Seitenverlauf: Frage → drei Welten → Ort → Tempo → Begleitung → Einstieg → Anfrage.

1. **Hero** – „Was bewegt dich?“; „bewegt“ als Mehrfachbelichtung mit roten
   Zeitmarken. Drei Wahlschalter (Reformer, Gym, Kurse) isolieren die passenden
   Frames der Bildleiste und schreiben sich direkt in die Anfrage.
2. **Studien** – Reformer Pilates, Boutique Gym und Kurse schieben sich beim
   Scrollen nacheinander übereinander (Wunsch aus v1); verdeckte Tafeln bleiben
   als Reiter sichtbar und fallen ins Grau. Preise und „… ausprobieren“ je Welt.
3. **Ort** – Kontaktbogen auf Barytpapier, rote Fettstift-Markierungen um die
   gewählten Frames; Prinzipien des Studios.
4. **Tempo** – fünf Motive „Bewegung passt in jedes Leben“ (KI, gekennzeichnet).
5. **12 Wochen** – zwölf Frames, deren Ziffern in Breite und Gewicht wachsen;
   eine rote Spur zeichnet sich beim Scrollen.
6. **Einstieg + FAQ** – drei Schritte auf einer Spur, native `details`.
7. **Anfrage** – „Protokoll“ auf Papier, das eine vorbereitete E-Mail öffnet;
   Telefon, Mail, Route.

Die Hauptaktion „Probetraining anfragen“ steht im Header, im Hero, an jeder
Tafel, im mobilen Menü, als mobile Sticky-Leiste und im Anfragebereich. Das
Protokoll überträgt keine Daten; es erzeugt nur einen `mailto:`-Link. Ohne
JavaScript bleibt ein direkter Mail-Link stehen.

## Gestaltung (Kurzfassung, Details in `DESIGN.md`)

- **Farbe:** Graphit und Kreide; drei Weltfarben aus den echten Räumen, die sich
  nie mischen (Flieder = Reformer-Deckenlicht, Amber = Gym-Wandleuchten,
  Grün = Springseil im Kursraum). Lemovi-Rot (aus dem Logo gemessen) nur für
  Bewegungsspuren, Fettstift und Hauptaktion.
- **Typografie:** Anybody (Breitenachse 50–150 %) für Fragen, Titel und Labels,
  Archivo für Text. Beide lokal gehostet (OFL), Lizenzen in `site/public/fonts/`.
- **Bewegung:** eine Easing-Familie; Hero-Belichtung einmalig beim Laden,
  Stapel und Spuren scrollgekoppelt, keine Endlosschleifen. Bei
  `prefers-reduced-motion` ist alles farbig, gezeichnet und still. Ohne
  JavaScript ist der Ausgangszustand vollständig und farbig.
- **Formen:** rechteckig wie Fotoplatten (0–2 px), Haarlinien statt Karten,
  Schatten nur dort, wo ein Blatt über einem anderen liegt.

Styles: `site/src/style.css` importiert `styles/base.css` (Schriften, Tokens,
Browser-Oberflächen), `components.css`, `sections.css`, `motion.css`.
Skript: `site/src/main.ts`.

## Inhalte und Pflegehinweise

- Texte, Kurse, Leistungen und Kontaktdaten stammen von lemovisports.de.
  Keine erfundenen Bewertungen, Zahlen oder Leistungsversprechen.
- **Preise** (Reformer Single Pass 25 €, 4×/Monat inkl. Gym 74,90 €, lemovi basic
  24 Monate 34,90 €/Monat, 12 Monate 39,90 €/Monat, Aufnahmegebühr 49,90 €) sind
  von der Website übernommen, Stand Oktober 2026. Bei Änderungen in
  `site/index.html` (Abschnitt „Studies“) anpassen.
- Mit „KI-Motiv“ markierte Bilder sind KI-generierte Kampagnenmotive; ein
  Hinweis steht zusätzlich im Footer. Alle Fotos der Hero-Bildleiste und des
  Kontaktbogens sind echt.

## Medien und Herkunft

Jede ausgelieferte Rastergrafik trägt ihre Herkunft: KI-Motive den exakten
Generierungs-Prompt, echte Fotos ihre Quelle (WebP: Datei `<bild>.webp.json`
daneben, PNG: eingebettet). Prüfen mit
`impeccable embed-prompt --scan site/public/media` (aus dem Impeccable-Skill).
Nicht mehr genutzte Medien aus v1 (Kampagnenfilm, Bild-Pills, Bewegungsstudie,
große Varianten) wurden aus `site/public/` entfernt und liegen in der
Git-Historie.

| Motiv | Verwendung | Herkunft |
| --- | --- | --- |
| Reformer-Raum, Reformer-Training/-Detail, Gym, Kursraum, Gespräch, Spiegel, Dehnung s/w | Bildleiste, Tafeln, Kontaktbogen | Echte Fotos, Website |
| Frau im Gym (`287b6f96-….png`) | Bildleiste, Tafel Gym | Echtes Foto; Einwilligung bestätigt (Oktober 2026). Die Rohdatei bleibt lokal, die WebP-Varianten sind im Repo. |
| Hantel-Detail, Faustgruß, fünf Tempo-Motive | Tafeln Gym/Kurse, Tempo | Higgsfield (KI), gekennzeichnet |

**Gewünscht für später:** ein kurzer, echter Bewegungsclip aus dem Studio; daraus
ließe sich eine echte chronofotografische Bildfolge für die Tafeln gewinnen.

## Sichere Higgsfield-Ergänzung

`scripts/generate-media.ts` verwendet ausschließlich das installierte offizielle
SDK und die dokumentierten Modelle. Es lädt `HF_CREDENTIALS` aus der bestehenden
`.env.local`, nur serverseitig. Generierungen sind kostenpflichtig; der Befehl
`npm.cmd run generate:media` startet neue Aufträge und gehört nicht zum Build oder
zum Dev-Server. Nicht erneut ausführen, wenn nur eine Vorschau benötigt wird.

Die erfolgreichen generierten Originale, sichere Auftragsmetadaten und Prompts
liegen in `.local/generated/` bzw. `.local/campaign-v2/`. `.local/`, `.env*` und
`dist/` sind ignoriert. Vite bedient nur `site/`, lädt keine
Projekt-Umgebungsdateien und blockiert Zugriffe auf Servercode sowie vertrauliche
Dateien. Das Frontend enthält weder das Higgsfield-SDK noch Zugangsdaten.

## Ursprüngliches Seedance-2.5-Beispiel

Requires Node.js 22 or newer. Install dependencies with `npm ci`.

Set `HF_CREDENTIALS=key-id:key-secret` locally in `.env.local`. This file is
ignored by Git and loaded quietly at runtime. Keep it on the server; do not
serve the project directory as static files or include this script in a browser bundle.

Run `npm run typecheck`, then `npm run generate`.
Each generation is billable. The example uses the official SDK's `subscribe`
method with automatic polling for `bytedance/seedance-2.5/text-to-video`:
"A cinematic scene at sunset", 5 seconds, 720p, 16:9.
It prints the video URL only after completion and exits unsuccessfully for
failed, canceled, moderated, missing-output, or API-error responses.
Raw SDK errors are intentionally not logged because they may contain credentials.

The installed SDK only ends polling for `completed`, `failed`, and `nsfw`.
If the API returns a canceled status during polling, the SDK may time out
instead; the example reports that completion is unverified and exits with failure.
Polling is limited to 30 minutes. A timeout does not cancel the remote request;
check its state in the Higgsfield console before submitting another billable request.

Official references:
- https://docs.higgsfield.ai/docs/how-to/sdk
- https://console.higgsfield.ai/models/bytedance/seedance-2.5/text-to-video/api-reference
