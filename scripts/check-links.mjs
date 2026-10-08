import { readFile, writeFile } from 'node:fs/promises';
const html = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
const links = [...new Set([...html.matchAll(/href="(https:[^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&')))];
const results = await Promise.allSettled(links.map(async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 LemoviLocalPreviewCheck' } });
  return { url, status: response.status, finalUrl: response.url };
}));
const report = results.map((result, index) => result.status === 'fulfilled' ? result.value : { url: links[index], status: 'unverified', reason: result.reason.name });
await writeFile(new URL('../.local/link-report.json', import.meta.url), JSON.stringify(report, null, 2));
report.forEach(result => console.log(`${result.status} ${result.url}`));
if (report.some(result => result.status === 404 || result.status === 410)) process.exitCode = 1;
