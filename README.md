# Lemovi Sports — lokale Landingpage

Die Startseite liegt in `site/` (Vite + TypeScript, ohne Framework). Die
Higgsfield-Integration in `index.ts` bleibt unverändert. Es wurde nichts live
veröffentlicht. Der vorherige Stand ist unter `.local/revisions/v2/` gesichert.

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
Zielgrößen, Menü mit Fokusfalle, Scrollspy, FAQ, Anfrage-Konfigurator,
Hero-Video, Scroll-Reveals mit Bewegung, Karussell, Sticky-CTA, Nutzung ohne
JavaScript, `prefers-reduced-motion` und Zugriffsschutz für Servercode.

## Seitenaufbau

Seitenverlauf: Aufmerksamkeit → Angebot → Vorteile → Vertrauen → Anfrage.

1. **Hero** – Kampagnenfilm, Hauptbotschaft, CTA „Probetraining anfragen“, Glaskarte mit echtem Studiofoto
2. **Manifest** – Satz mit eingebetteten Bild-Pills, der beim Scrollen aufleuchtet; drei Fakten
3. **Angebote** – drei gestapelte Bildpanels (Reformer, Gym, Kurse) mit Glaskarten und Preisen
4. **Kursband** – scrollgekoppeltes Laufband
5. **Studio** – Rundbogen-Collage echter Fotos, Prinzipien, Beratungsszene
6. **Bildmoment** – vollflächiges Motiv, das sich beim Scrollen öffnet
7. **Dein Tempo** – Karussell (Buttons, Tastatur, Ziehen mit der Maus)
8. **12-Wochen-Programm** – Glaskacheln über Licht-Verläufen
9. **Einstieg + FAQ** – drei Schritte, native `details`
10. **Kontakt** – Anfrage-Konfigurator, der eine vorbereitete E-Mail öffnet; Telefon, Mail, Route

Die zentrale Handlung „Probetraining anfragen“ steht im Header, im Hero, im
mobilen Menü, als mobile Sticky-Leiste und im Kontaktbereich. Der Konfigurator
überträgt keine Daten; er erzeugt nur einen `mailto:`-Link. Ohne JavaScript
bleibt ein direkter Mail-Link stehen.

## Gestaltung

- **Farbwelt aus dem echten Studio:** Nachtgrau, Amber (Wandleuchten), Flieder
  (Deckenlicht), Creme und das Rot des Logos. Rundbögen zitieren die Spiegel.
- **Typografie:** Bricolage Grotesque (Display), Cormorant Garamond Italic
  (Akzente), Manrope (Text). Alle Schriften lokal gehostet, Lizenzen in `site/public/fonts/`.
- **Glas** nur über Bild, Video oder Farbe: Navigation, Hero-Chips/Karte,
  Angebotskarten, Bildunterschriften, Programmkacheln, Konfigurator, Sticky-Leiste.
  Fallbacks für fehlendes `backdrop-filter`, `prefers-reduced-transparency`
  und Forced Colors. Kontrast aller Glasflächen gegen den hellsten realen
  Hintergrund gemessen: mindestens 5,0 : 1.
- **Bewegung:** eine Easing-Familie, nur `transform`/`opacity`, kein
  Scroll-Hijacking, Hero-Eingang unter einer Sekunde. Parallax ist auf
  Smartphones deaktiviert. Bei `prefers-reduced-motion` ist alles statisch,
  und das Video startet nur auf Klick.
- **Performance:** Kritischer Pfad ≈ 24 KB (HTML+CSS+JS, gzip) + 124 KB Schriften
  + Hero-Bild 29 KB (mobil) / 46 KB (Desktop). Video erst nach `load`, nicht bei
  Datensparmodus. Gemessen: CLS 0,00–0,01, keine langen Frames beim Scrollen
  auch mit 4× gedrosselter CPU.

Styles: `site/src/style.css` importiert `styles/base.css` (Tokens, Typo),
`glass.css`, `components.css`, `sections.css`, `motion.css`.
Skript: `site/src/main.ts`.

## Inhalte und Pflegehinweise

- Texte, Kurse, Leistungen und Kontaktdaten stammen von lemovisports.de.
  Keine erfundenen Bewertungen, Zahlen oder Leistungsversprechen.
- **Preise** (Reformer Single Pass 25 €, 4×/Monat inkl. Gym 74,90 €, lemovi basic
  24 Monate 34,90 €/Monat, Aufnahmegebühr 49,90 €) sind von der Website übernommen,
  Stand Oktober 2026. Bei Änderungen in `site/index.html` (Abschnitt „OFFERS“) anpassen.
- Mit „KI-Motiv“ markierte Bilder sowie der Hero-Film sind KI-generierte
  Kampagnenmotive; ein Hinweis steht zusätzlich im Footer.

## Medien

`npm.cmd run prepare:redesign` (`scripts/prepare-redesign.mjs`) erzeugt die
zusätzlichen WebP-Varianten und kopiert die Display-Schrift. Ältere Varianten
stammen aus `prepare:media` und `prepare:campaign`.

| Motiv | Verwendung | Herkunft |
| --- | --- | --- |
| Kampagnenfilm / Standbild | Hero | Higgsfield (KI), gekennzeichnet |
| Reformer-Raum (violettes Licht) | Hero-Karte, Studio-Collage | Echtes Foto, Website |
| Reformer-Training, Reformer-Detail | Angebot Reformer | Echte Fotos, Website |
| Frau am Trainingsgerät im Gym | Angebot Gym | Datei `287b6f96-….png` im Projektordner |
| Seilspringen im Kursraum | Angebot Kurse | Echtes Foto, Website |
| Spiegel-Triptychon | Studio-Collage | `image-480x480.png` im Projektordner |
| Beratungsgespräch | Studio | Echtes Foto, Website |
| Gym mit Wandleuchten | Kontakt-Hintergrund | Echtes Foto, Website |
| Dehnung vor Backstein (s/w) | Einstieg, Manifest-Pill | Echtes Foto, Website |
| Hantel-Detail, Faustgruß, Gemeinschaft, Tempo-Motive, Gespräch | Angebote, Bildmoment, Karussell, Programm | Higgsfield (KI), gekennzeichnet |

**Bitte prüfen:** Für das Foto der Frau im Gym (`287b6f96-….png`) muss vor der
Veröffentlichung die Einwilligung der abgebildeten Person vorliegen.
**Gewünscht für später:** ein kurzer, echter Reformer-Clip aus dem Studio als
Ersatz für den KI-Kampagnenfilm. Die Dateien `movement-study-*` aus der früheren
Version werden nicht mehr verwendet.

## Sichere Higgsfield-Ergänzung

`scripts/generate-media.ts` verwendet ausschließlich das installierte offizielle
SDK und die dokumentierten Modelle. Es lädt `HF_CREDENTIALS` aus der bestehenden
`.env.local`, nur serverseitig. Generierungen sind kostenpflichtig; der Befehl
`npm.cmd run generate:media` startet neue Aufträge und gehört nicht zum Build oder
zum Dev-Server. Nicht erneut ausführen, wenn nur eine Vorschau benötigt wird.

Die erfolgreichen generierten Originale, sichere Auftragsmetadaten und Prompts
liegen in `.local/generated/`. `.local/`, `.env*` und `dist/` sind ignoriert.
Vite bedient nur `site/`, lädt keine Projekt-Umgebungsdateien und blockiert
Zugriffe auf Servercode sowie vertrauliche Dateien. Das Frontend enthält weder
das Higgsfield-SDK noch Zugangsdaten. Der Build wurde auf die hinterlegten
Credential-Werte geprüft.

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
