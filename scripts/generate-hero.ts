import { config as loadEnv } from 'dotenv';
import { config, higgsfield } from '@higgsfield/client/v2';
import { access, readFile, writeFile } from 'node:fs/promises';
loadEnv({ path: new URL('../.env.local', import.meta.url), quiet: true });
const credentials = process.env.HF_CREDENTIALS;
if (!credentials || !/^[^:\s]+:[^:\s]+$/.test(credentials)) process.exit(1);
config({ credentials, maxRetries: 0, maxPollTime: 20 * 60 * 1000, pollInterval: 5000 });
const directory = new URL('../.local/campaign-v2/', import.meta.url);
const mode = process.argv[2];
async function exists(url: URL): Promise<boolean> { try { await access(url); return true; } catch { return false; } }
try {
  let result;
  let output;
  if (mode === 'image') {
    output = new URL('11-energy-clean.jpg', directory);
    if (await exists(output)) { console.log('Completed clean hero image already exists.'); process.exit(0); }
    const marker = new URL('11-energy-clean.pending.json', directory);
    if (await exists(marker)) throw new Error('UnverifiedExistingJob');
    await writeFile(marker, JSON.stringify({ submittedAt: new Date().toISOString() }));
    const prompt = 'A realistic candid full-body photograph taken with a Canon R5, 50mm lens. A happy 45-year-old woman with a natural average athletic body, dark brown ponytail, charcoal tank top with muted rose trim, dark leggings and white athletic shoes, enjoying a simple warm-up side step. She stands in the right third of a wide horizontal frame. Both feet fully visible. The left half shows only an empty plain dark-grey wall without any objects or markings. Soft warm golden side light on her face and arms, subtle warm oak floor, natural mature skin, a genuine smile, understated European fitness photography, healthy movement joy, believable anatomy and proportions. It is one ordinary photograph without design elements. No letters anywhere, no writing, no words, no graphic overlays, no typography, no labels, no logos or watermark. The blank wall stays entirely blank.';
    console.log('Generating clean hero replacement, image 11.');
    result = await higgsfield.subscribe('higgsfield-ai/soul/v2/standard', { input: { prompt, batch_size: 1, resolution: '1080p', aspect_ratio: '16:9', enhance_prompt: false, seed: 906521 }, withPolling: true });
    if (result.status !== 'completed' || !result.images?.[0]?.url) throw new Error('NotCompleted');
    await writeFile(new URL('11-energy-clean.json', directory), JSON.stringify({ model: 'higgsfield-ai/soul/v2/standard', status: result.status, requestId: result.request_id, remoteUrl: result.images[0].url, prompt }, null, 2));
  } else if (mode === 'video') {
    output = new URL('hero-clean.mp4', directory);
    if (await exists(output)) { console.log('Completed clean hero film already exists.'); process.exit(0); }
    const marker = new URL('hero-clean.pending.json', directory);
    if (await exists(marker)) throw new Error('UnverifiedExistingJob');
    const image = JSON.parse(await readFile(new URL('11-energy-clean.json', directory), 'utf8')) as { remoteUrl: string };
    await writeFile(marker, JSON.stringify({ submittedAt: new Date().toISOString() }));
    console.log('Animating the visually approved clean hero image.');
    result = await higgsfield.subscribe('bytedance/seedance-2.5/image-to-video', {
      input: { image_url: image.remoteUrl, end_image_url: image.remoteUrl, prompt: 'The adult woman performs two small lively side steps with soft knee bends and easy natural arm movement, enjoying the warm-up and smiling. Her body, hands and feet move naturally and remain on the right of the frame. The left half stays an entirely blank dark-grey wall. Locked-off wide camera, no cuts, no zoom, no new objects, no writing or logos. Preserve her identity, outfit, natural proportions, lighting, floor and composition. Finish gently in the original starting position to create a seamless six-second loop. Silent.', duration: 6, resolution: '1080p', output_format: 'mp4', generate_audio: false },
      withPolling: true,
    });
    if (result.status !== 'completed' || !result.video?.url) throw new Error('NotCompleted');
    await writeFile(new URL('hero-clean.json', directory), JSON.stringify({ model: 'bytedance/seedance-2.5/image-to-video', status: result.status, requestId: result.request_id, duration: 6 }, null, 2));
  } else throw new Error('ChooseMode');
  const url = mode === 'image' ? result.images?.[0]?.url : result.video?.url;
  if (!url || new URL(url).protocol !== 'https:') throw new Error('MissingOutput');
  const download = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!download.ok) throw new Error('DownloadError');
  await writeFile(output, Buffer.from(await download.arrayBuffer()));
  console.log(`Clean hero ${mode} saved.`);
} catch (error: unknown) {
  const name = error instanceof Error ? error.name : 'UnknownError';
  const safe = error instanceof Error && ['UnverifiedExistingJob', 'ChooseMode', 'NotCompleted', 'MissingOutput', 'DownloadError'].includes(error.message) ? error.message : name;
  console.error(`Hero generation could not be verified (${safe}). No raw API error or credentials were logged.`);
  process.exitCode = 1;
}
