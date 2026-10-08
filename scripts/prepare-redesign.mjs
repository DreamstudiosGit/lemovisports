// Optimised variants for the redesigned landing page. Only existing project
// assets are used: real Lemovi photographs and the documented campaign set.
import sharp from 'sharp';
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const file = path => fileURLToPath(new URL(`../${path}`, import.meta.url));
const media = file('site/public/media/');
const fonts = file('site/public/fonts/');
await mkdir(media, { recursive: true });
await mkdir(fonts, { recursive: true });

// [name, source, widths, generated]
const photos = [
  ['gym-portrait', '287b6f96-367b-4c12-91b4-262497134258.png', [480, 800, 1278], false],
  ['movement-real', '.local/originals/movement-real.jpg', [480, 960, 1366], false],
  ['mirrors', 'image-480x480.png', [480], false],
  ['campaign-balance', '.local/campaign-v2/03-balance.jpg', [480, 800, 1200], true],
  ['campaign-grip', '.local/campaign-v2/06-grip.jpg', [480, 800], true],
  ['campaign-together', '.local/campaign-v2/10-together.jpg', [480, 800, 1200], true],
  ['campaign-strength', '.local/campaign-v2/02-strength.jpg', [1200], true],
];

// Small inline "word pills" for the manifesto: [name, source, left%, top%, width%].
const pills = [
  ['pill-kraft', '.local/originals/jumping.jpg', .18, .12, .62],
  ['pill-ruhe', '.local/originals/movement-real.jpg', .2, .3, .6],
  ['pill-energie', '.local/originals/training.jpg', .3, .08, .4],
];

const report = [];
for (const [name, source, widths, generated] of photos) {
  const meta = await sharp(file(source)).metadata();
  for (const width of widths.filter(w => w <= meta.width)) {
    const target = `${media}${name}-${width}.webp`;
    await sharp(file(source)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(target);
    report.push({ file: `${name}-${width}.webp`, bytes: (await stat(target)).size, generated });
  }
}
for (const [name, source, left, top, width] of pills) {
  const meta = await sharp(file(source)).metadata();
  const w = Math.round(meta.width * width);
  const h = Math.round(w * 0.58);
  const target = `${media}${name}.webp`;
  await sharp(file(source)).rotate()
    .extract({ left: Math.round(meta.width * left), top: Math.min(Math.round(meta.height * top), meta.height - h), width: w, height: h })
    .resize({ width: 360 }).webp({ quality: 78 }).toFile(target);
  report.push({ file: `${name}.webp`, bytes: (await stat(target)).size, generated: false });
}

// Fonts for v2 are copied by prepare-media.mjs.

await mkdir(file('.local/'), { recursive: true });
await writeFile(file('.local/redesign-media.json'), JSON.stringify(report, null, 2));
console.log(report.map(item => `${item.file} ${(item.bytes / 1024).toFixed(1)} KB`).join('\n'));
