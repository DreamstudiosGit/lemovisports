import { config as loadEnv } from 'dotenv';
import { config, higgsfield } from '@higgsfield/client/v2';
import { mkdir, writeFile } from 'node:fs/promises';

// This script stays outside Vite's site root. No credentials or SDK reach the browser.
loadEnv({ path: new URL('../.env.local', import.meta.url), quiet: true });
const credentials = process.env.HF_CREDENTIALS;
if (!credentials || !/^[^:\s]+:[^:\s]+$/.test(credentials)) {
  console.error('Higgsfield credentials are missing or invalid.');
  process.exit(1);
}
config({ credentials, maxRetries: 0, maxPollTime: 20 * 60 * 1000, pollInterval: 5000 });
const directory = new URL('../.local/generated/', import.meta.url);
await mkdir(directory, { recursive: true });

const subject = 'Premium editorial movement study, extreme close-up of two adult hands gently holding a coral red Pilates resistance ring, natural skin texture, arms entering the frame from the right, muted terracotta athletic clothing partially visible, warm cream seamless background, soft late-afternoon sidelight, long delicate shadows, tactile photographic grain, understated European wellness magazine aesthetic. Wide asymmetrical composition with generous empty space on the left. No face, no identifiable person, no studio room, no text, no logo. Natural anatomy, realistic equipment.';

async function download(url: string | undefined, filename: string): Promise<void> {
  if (!url || !URL.canParse(url) || new URL(url).protocol !== 'https:') throw new Error('MissingOutput');
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error('DownloadError');
  await writeFile(new URL(filename, directory), Buffer.from(await response.arrayBuffer()));
}

try {
  console.log('Generating one atmospheric image with Soul 2.');
  const still = await higgsfield.subscribe('higgsfield-ai/soul/v2/standard', {
    input: { prompt: subject, batch_size: 1, resolution: '1080p', aspect_ratio: '16:9', enhance_prompt: false, seed: 34819 },
    withPolling: true,
  });
  if (still.status !== 'completed') throw new Error('ImageNotCompleted');
  await download(still.images?.[0]?.url, 'movement.jpg');
  await writeFile(new URL('image-job.json', directory), JSON.stringify({ model: 'higgsfield-ai/soul/v2/standard', requestId: still.request_id, status: still.status, prompt: subject }, null, 2));
  console.log('Atmospheric image saved. Generating one silent five-second movement study.');
  const clip = await higgsfield.subscribe('bytedance/seedance-2.5/text-to-video', {
    input: { prompt: subject + ' Locked-off camera. The hands very slowly compress the ring a little, then release it to its original shape. One controlled gentle repetition over five seconds. Minimal calm movement, seamless beginning and end. No camera movement, no sound.', duration: 5, resolution: '720p', aspect_ratio: '16:9', output_format: 'mp4', generate_audio: false },
    withPolling: true,
  });
  if (clip.status !== 'completed') throw new Error('VideoNotCompleted');
  await download(clip.video?.url, 'movement.mp4');
  await writeFile(new URL('video-job.json', directory), JSON.stringify({ model: 'bytedance/seedance-2.5/text-to-video', requestId: clip.request_id, status: clip.status, duration: 5 }, null, 2));
  console.log('Silent five-second video saved.');
} catch (error: unknown) {
  // Never print SDK errors, response bodies, headers, credential values or URLs.
  const name = error instanceof Error ? error.name : 'UnknownError';
  const reason = error instanceof Error && ['MissingOutput', 'DownloadError', 'ImageNotCompleted', 'VideoNotCompleted'].includes(error.message) ? error.message : name;
  const safeReasons: Record<string, string> = {
    AuthenticationError: 'Authentication rejected by Higgsfield.',
    NotEnoughCreditsError: 'Higgsfield generation blocked by insufficient API credits.',
    AccountError: 'Higgsfield account access or API balance rejected.',
    ValidationError: 'Higgsfield rejected the documented request parameters.',
    BadInputError: 'Higgsfield rejected the input.',
    TimeoutError: 'Generation polling timed out. Do not resubmit without checking the existing job.',
    MissingOutput: 'Generation returned no usable output.',
    DownloadError: 'The generated asset could not be downloaded.',
    ImageNotCompleted: 'Image generation did not complete.',
    VideoNotCompleted: 'Video generation did not complete.',
  };
  const message = safeReasons[reason] ?? 'Higgsfield generation failed; original studio media remains available.';
  console.error(message);
  await writeFile(new URL('status.json', directory), JSON.stringify({ status: 'blocked', reason: message }, null, 2));
  process.exitCode = 1;
}
