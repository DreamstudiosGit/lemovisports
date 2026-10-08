import sharp from 'sharp';
import { copyFile, mkdir, access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../site/public/media/', import.meta.url);
await mkdir(output, { recursive: true });
const assets = [
  ['reformer-session', '../.local/originals/jumping.jpg', '../image-480x480 (1).jpg'],
  ['reformer-detail', '../.local/originals/reformer.jpg', '../image-480x480 (1).jpg'],
  ['studio', '../.local/originals/studio.jpg', '../image-960x960.jpg'],
  ['gym', '../.local/originals/gym.jpg', '../image-240x240.jpg'],
  ['courses', '../.local/originals/training.jpg', '../image-960x770 (1).jpg'],
  ['coaching', '../.local/originals/coaching.jpg', null],
  ['movement-study', '../.local/generated/movement.jpg', null],
];
const inventory = [];
for (const [name, original, fallback] of assets) {
  let source = new URL(original, import.meta.url);
  try { await access(source); } catch {
    if (!fallback) { console.log(`Unavailable: ${name}`); continue; }
    source = new URL(fallback, import.meta.url);
  }
  const metadata = await sharp(fileURLToPath(source)).metadata();
  const widths = [...new Set([400, 640, 960, 1280, 1920].filter(width => width < metadata.width).concat(Math.min(metadata.width, 1920)))];
  for (const width of widths) {
    await sharp(fileURLToPath(source)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: name === 'reformer-session' ? 86 : 80, effort: 5 }).toFile(fileURLToPath(new URL(`${name}-${width}.webp`, output)));
  }
  inventory.push({ name, original: original.replace('../.local/', ''), width: metadata.width, height: metadata.height, sizes: widths, generated: name === 'movement-study' });
  console.log(`Optimized ${name}: ${widths.join(', ')}px`);
}
await copyFile(new URL('../image-342x118.png', import.meta.url), new URL('lemovi-logo.png', output));
try {
  await copyFile(new URL('../.local/generated/movement.mp4', import.meta.url), new URL('movement-study.mp4', output));
  console.log('Copied generated silent video.');
} catch { console.log('Generated video not available yet.'); }

const fonts = new URL('../site/public/fonts/', import.meta.url);
await mkdir(fonts, { recursive: true });
// v2 typefaces (OFL): Anybody for display widths, Archivo for text.
await copyFile(new URL('../node_modules/@fontsource-variable/anybody/files/anybody-latin-wdth-normal.woff2', import.meta.url), new URL('anybody-latin.woff2', fonts));
await copyFile(new URL('../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2', import.meta.url), new URL('archivo-latin.woff2', fonts));
await copyFile(new URL('../node_modules/@fontsource-variable/anybody/LICENSE', import.meta.url), new URL('anybody-LICENSE.txt', fonts));
await copyFile(new URL('../node_modules/@fontsource-variable/archivo/LICENSE', import.meta.url), new URL('archivo-LICENSE.txt', fonts));
await writeFile(new URL('../.local/media-inventory.json', import.meta.url), JSON.stringify(inventory, null, 2));
