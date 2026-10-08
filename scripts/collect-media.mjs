import { mkdir, writeFile, copyFile } from 'node:fs/promises';
const directory = new URL('../.local/originals/', import.meta.url);
await mkdir(directory, { recursive: true });
const assets = [
  ['studio', '/wp-content/uploads/go-x/u/eac74c42-f81b-421c-b178-94f97ad5caa2/image.jpg'],
  ['reformer', '/wp-content/uploads/go-x/u/2d604390-9591-41f1-8089-08b0ee449a89/l618,t734,w660,h660/image.jpg'],
  ['movement-real', '/wp-content/uploads/go-x/u/eb8c519b-ae51-4fdd-874c-717461502d4d/l133,t0,w1499,h1499/image-1366x1366.jpg'],
  ['jumping', '/wp-content/uploads/go-x/u/2d604390-9591-41f1-8089-08b0ee449a89/l0,t865,w1280,h1027/image.jpg'],
  ['coaching', '/wp-content/uploads/go-x/u/7df4f2f2-80ea-4827-8309-82bae881235f/l169,t0,w1662,h1333/image-1366x1096.jpg'],
  ['training', '/wp-content/uploads/go-x/u/806da424-7e07-48df-9bbb-e619dfd3224a/l146,t0,w1346,h1080/image.jpg'],
  ['gym', '/wp-content/uploads/go-x/u/26d03958-1e71-4826-a65f-1cdfd4ab99fd/image.jpg'],
];
const results = await Promise.allSettled(assets.map(async ([name, path]) => {
  const response = await fetch('https://www.lemovisports.de' + path, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  await writeFile(new URL(name + '.jpg', directory), Buffer.from(await response.arrayBuffer()));
  console.log(`Downloaded original website photograph: ${name}`);
}));
results.forEach(result => { if (result.status === 'rejected') console.error(result.reason.message); });
await mkdir(new URL('../site/public/media/', import.meta.url), { recursive: true });
await copyFile(new URL('../image-342x118.png', import.meta.url), new URL('../site/public/media/lemovi-logo.png', import.meta.url));
