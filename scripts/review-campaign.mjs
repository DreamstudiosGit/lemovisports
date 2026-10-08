import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
const directory = '.local/campaign-v2';
const files = (await readdir(directory)).filter(file => /^\d\d-.*\.jpg$/.test(file));
const rows = Math.ceil(files.length / 5);
const layers = [];
for (const [index, file] of files.entries()) {
  const x = index % 5 * 320;
  const y = Math.floor(index / 5) * 520;
  layers.push({ input: await sharp(`${directory}/${file}`).resize(308, 472, { fit: 'contain', background: '#eee9df' }).jpeg().toBuffer(), left: x + 6, top: y + 4 });
  layers.push({ input: Buffer.from(`<svg width="320" height="36"><text x="10" y="24" font-family="Arial" font-size="16">${file}</text></svg>`), left: x, top: y + 477 });
}
await sharp({ create: { width: 1600, height: rows * 520, channels: 3, background: '#eee9df' } }).composite(layers).jpeg({ quality: 90 }).toFile('.local/campaign-review.jpg');
console.log(`${files.length} images on the review contact sheet.`);
