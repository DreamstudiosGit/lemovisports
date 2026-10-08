import sharp from 'sharp';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const run = promisify(execFile);
const source = fileURLToPath(new URL('../.local/campaign-v2/', import.meta.url));
const target = fileURLToPath(new URL('../site/public/media/', import.meta.url));
const review = fileURLToPath(new URL('../.local/campaign-frames/', import.meta.url));
await mkdir(target, { recursive: true });
await mkdir(review, { recursive: true });
const clips = [
  ['hero-desktop', 'scale=1280:720'],
  ['hero-mobile', 'crop=ih*9/16:ih:iw*0.64-ih*9/32:0,scale=540:960'],
];
for (const [name, filter] of clips) {
  await run(ffmpeg.path, ['-y', '-i', `${source}hero-clean.mp4`, '-vf', `${filter},fps=24`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', `${target}${name}.mp4`], { windowsHide: true, maxBuffer: 4_000_000 });
}
// Keep a crisp still of the opening pose; use the same crop as the mobile film.
await run(ffmpeg.path, ['-y', '-i', `${source}hero-clean.mp4`, '-frames:v', '1', `${review}hero-poster.jpg`], { windowsHide: true });
await run(ffmpeg.path, ['-y', '-i', `${target}hero-mobile.mp4`, '-frames:v', '1', `${review}hero-mobile-poster.jpg`], { windowsHide: true });
const heroMetadata = await sharp(`${source}11-energy-clean.jpg`).metadata();
const cropWidth = Math.floor(heroMetadata.height * 9 / 16);
const cropLeft = Math.floor(heroMetadata.width * .64 - cropWidth / 2);
await sharp(`${source}11-energy-clean.jpg`).extract({ left: cropLeft, top: 0, width: cropWidth, height: heroMetadata.height }).jpeg({ quality: 94 }).toFile(`${review}hero-mobile-still.jpg`);
const photos = [
  ['campaign-energy', `${source}11-energy-clean.jpg`, [400, 640, 960, 1280, 1920]],
  ['campaign-strength', `${source}02-strength.jpg`, [400, 640, 960]],
  ['campaign-support', `${source}04-support.jpg`, [400, 640, 960, 1280]],
  ['campaign-community', `${source}05-community.jpg`, [400, 640, 960, 1280, 1920]],
  ['campaign-mobility', `${source}07-mobility.jpg`, [400, 640, 960, 1280]],
  ['campaign-reset', `${source}08-reset.jpg`, [400, 640, 960]],
  ['campaign-small-win', `${source}09-small-win.jpg`, [400, 640, 960]],
  ['hero-mobile', `${review}hero-mobile-still.jpg`, [400, 640]],
];
const sizes = [];
for (const [name, image, widths] of photos) {
  for (const width of widths) {
    const output = `${target}${name}-${width}.webp`;
    await sharp(image).rotate().resize({ width }).webp({ quality: 81, effort: 5 }).toFile(output);
    sizes.push({ file: `${name}-${width}.webp`, bytes: (await stat(output)).size });
  }
}
for (const t of [0, 1, 3, 5.8]) {
  await run(ffmpeg.path, ['-y', '-ss', String(t), '-i', `${source}hero-clean.mp4`, '-frames:v', '1', '-vf', 'scale=960:540', `${review}frame-${t}.jpg`], { windowsHide: true });
}
await sharp({ create: { width: 1920, height: 1080, channels: 3, background: '#f6f3ec' } }).composite([
  { input: `${review}frame-0.jpg`, left: 0, top: 0 }, { input: `${review}frame-1.jpg`, left: 960, top: 0 },
  { input: `${review}frame-3.jpg`, left: 0, top: 540 }, { input: `${review}frame-5.8.jpg`, left: 960, top: 540 },
]).jpeg({ quality: 88 }).toFile(`${review}hero-review.jpg`);
for (const [name] of clips) sizes.push({ file: `${name}.mp4`, bytes: (await stat(`${target}${name}.mp4`)).size });
await writeFile(`${review}media-sizes.json`, JSON.stringify(sizes, null, 2));
console.log(JSON.stringify(sizes.filter(item => item.file.endsWith('.mp4') || item.file.endsWith('-1920.webp'))));
