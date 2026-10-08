import { config as loadEnv } from 'dotenv';
import { config, higgsfield } from '@higgsfield/client/v2';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';

// A new campaign; the first iteration and supplied originals remain untouched.
loadEnv({ path: new URL('../.env.local', import.meta.url), quiet: true });
const credentials = process.env.HF_CREDENTIALS;
if (!credentials || !/^[^:\s]+:[^:\s]+$/.test(credentials)) {
  console.error('Higgsfield credentials are missing or invalid.');
  process.exit(1);
}
config({ credentials, maxRetries: 0, maxPollTime: 20 * 60 * 1000, pollInterval: 5000 });
const directory = new URL('../.local/campaign-v2/', import.meta.url);
await mkdir(directory, { recursive: true });
const style = 'One coherent premium European fitness editorial campaign. Inspired by a welcoming middle-aged woman in charcoal sportswear, soft grey surroundings, warm amber wall lighting and wood in the supplied visual reference. Natural warm skin tones, soft golden side light, muted charcoal-grey seamless photographic backdrop, understated honey-oak floor, cream and taupe accents, dark charcoal athletic clothing with a subtle muted rose detail. Sophisticated candid real-camera photograph, 50mm lens, tactile natural skin, gentle film grain, soft shadow detail, no orange color cast, no fashion retouching. Ordinary adult bodies with believable muscle tone and realistic proportions. Authentic relaxed expressions. This is an illustrative campaign set, NOT a real identifiable studio, staff or testimonial. No recognizable architecture, no walls of gym machines, no logos, no words, no numbers, no watermarks. Anatomically correct hands and feet, five fingers, no duplicate limbs, no warped equipment.';

const shots = [
  { id: '01-energy', ratio: '16:9', story: 'Wide cinematic full-body scene. A cheerful adult woman around age 44 with shoulder-length dark brown hair tied back, average athletic build, wearing a charcoal tank and leggings, is in a natural lively side-step warm-up with a small knee bend, arms relaxed and slightly raised. Her entire body and white trainers are visible. Subject occupies the RIGHT THIRD of the image with generous dark negative space covering the LEFT HALF for HTML headline overlay. Warm rim light in her hair, real smile, moving for pleasure rather than posing. Simple matte backdrop, no equipment.' },
  { id: '02-strength', ratio: '3:4', story: 'Three-quarter portrait of a smiling adult woman around age 53, naturally curvy strong build, dark blonde hair in a casual ponytail, charcoal sports top with muted rose piping. She has finished a controlled light strength exercise and is holding two modest black dumbbells by her sides. Both hands and the dumbbells are clearly anatomically correct. Cropped below the knee, confident friendly eye contact, natural mature face and skin.' },
  { id: '03-balance', ratio: '4:3', story: 'An adult woman around age 36 of East Asian appearance with an everyday fit build and black hair tied back, sitting cross-legged on a simple taupe exercise mat, doing a comfortable overhead arm stretch with both arms extended naturally. Three-quarter side view, easy gentle smile, entire arms and hands visible, calm controlled movement. Simple neutral backdrop and oak floor, no machinery.' },
  { id: '04-support', ratio: '3:2', story: 'Two adults in casual charcoal athletic clothing in a friendly conversation about exercise. A woman around age 48 with short chestnut hair and an average build listens warmly to a plus-size man around age 38. Both are standing at ease, eye contact, one subtle open hand gesture. Waist-up composition, genuine human support, no medical setting, no clipboards, no uniforms, no representation as actual staff. Negative space on the left, people on the right.' },
  { id: '05-community', ratio: '16:9', story: 'Three adult women ages approximately 29, 47 and 64, with different ordinary body shapes and skin tones, sitting together on a simple oak bench after exercise, sharing a spontaneous laugh. One woman is Black with natural curly hair, one has short silver hair, one has a brunette ponytail. Comfortable charcoal sportswear, natural mature faces, relaxed hands resting separately on thighs, no overlapping fingers. Wide candid image, warm side light, joyful and unforced. People across the middle and right, calm negative space on the left.' },
  { id: '06-grip', ratio: '1:1', story: 'A meaningful tactile exercise detail, close-up of one adult hand naturally gripping a small matte-black dumbbell handle, visible forearm, charcoal sleeve, soft amber side light on skin and subtle grey backdrop. Realistic grip, five normal fingers, one hand only, simple correct dumbbell design, refined shallow depth of field. The story is an accessible first step in strength training, not extreme bodybuilding.' },
  { id: '07-mobility', ratio: '3:2', story: 'An approachable adult man around age 66 with short grey hair and an ordinary healthy build, doing a gentle standing side stretch, one hand resting naturally on his hip and the other arm reaching overhead. Full-body photograph, white trainers, charcoal t-shirt and navy training trousers. Stable balanced feet, slight smile, believable relaxed joints, not extreme flexibility. Body on the right, warm grey negative space on the left.' },
  { id: '08-reset', ratio: '3:4', story: 'An adult plus-size woman around age 34 with auburn hair tied back, seated on a simple taupe exercise mat, legs comfortably extended and slightly bent, doing an easy forward stretch with hands resting on her own shins. Relaxed body, no extreme contortion. Candid contemplative expression and a gentle smile, charcoal leggings and muted rose-grey athletic top. Three-quarter view, full natural human anatomy.' },
  { id: '09-small-win', ratio: '3:4', story: 'An adult woman around age 46, average strong everyday build, wavy shoulder-length blonde hair loosely tied back, standing after a workout with hands comfortably on hips, shoulders relaxed, smiling with quiet pride and satisfaction. Charcoal sportswear, simple grey backdrop and honey-oak floor. Natural mature face, subtle perspiration, not sexualized, not a fashion model. Three-quarter portrait with negative space around her head.' },
  { id: '10-together', ratio: '4:3', story: 'Two adult friends, a Black woman around age 42 and a man around age 51 with a naturally stocky build, celebrating one small workout success with a gentle fist bump and genuine smiles. Waist-up candid composition, hands and fist bump visible and anatomically correct, adults looking at each other. Comfortable dark athletic clothing, warm side light, simple matte grey backdrop. Inclusive, friendly movement culture, no commercial gym machinery.' },
];

async function exists(file: URL): Promise<boolean> { try { await access(file); return true; } catch { return false; } }
async function download(url: string | undefined, file: URL): Promise<void> {
  if (!url || !URL.canParse(url) || new URL(url).protocol !== 'https:') throw new Error('MissingOutput');
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error('DownloadError');
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
}

const manifest = [];
try {
  for (const [index, shot] of shots.entries()) {
    const asset = new URL(`${shot.id}.jpg`, directory);
    const metadataFile = new URL(`${shot.id}.json`, directory);
    if (await exists(asset) && await exists(metadataFile)) {
      manifest.push(JSON.parse(await readFile(metadataFile, 'utf8')));
      console.log(`Existing completed image retained: ${shot.id}`);
      continue;
    }
    const marker = new URL(`${shot.id}.pending.json`, directory);
    if (await exists(marker)) throw new Error('UnverifiedExistingJob');
    await writeFile(marker, JSON.stringify({ id: shot.id, submittedAt: new Date().toISOString(), note: 'Do not resubmit blindly if interrupted.' }));
    const prompt = `${style} ${shot.story}`;
    console.log(`Generating campaign image ${index + 1}/10: ${shot.id}`);
    const result = await higgsfield.subscribe('higgsfield-ai/soul/v2/standard', {
      input: { prompt, batch_size: 1, resolution: '1080p', aspect_ratio: shot.ratio, enhance_prompt: false, seed: 684210 + index },
      withPolling: true,
    });
    if (result.status !== 'completed') throw new Error('NotCompleted');
    await download(result.images?.[0]?.url, asset);
    const metadata = { id: shot.id, model: 'higgsfield-ai/soul/v2/standard', requestId: result.request_id, status: result.status, remoteUrl: result.images?.[0]?.url, prompt, ratio: shot.ratio };
    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
    manifest.push(metadata);
    await writeFile(new URL('manifest.json', directory), JSON.stringify(manifest, null, 2));
    console.log(`Completed: ${shot.id}`);
  }
  const videoAsset = new URL('hero-source.mp4', directory);
  if (!(await exists(videoAsset))) {
    const marker = new URL('hero-video.pending.json', directory);
    if (await exists(marker)) throw new Error('UnverifiedExistingJob');
    await writeFile(marker, JSON.stringify({ submittedAt: new Date().toISOString(), note: 'Do not resubmit blindly if interrupted.' }));
    console.log('Generating one six-second silent hero film from the campaign image.');
    const imageUrl = manifest[0]?.remoteUrl;
    if (!imageUrl) throw new Error('MissingOutput');
    const clip = await higgsfield.subscribe('bytedance/seedance-2.5/image-to-video', {
      input: {
        image_url: imageUrl,
        end_image_url: imageUrl,
        prompt: 'A warm cinematic movement campaign. The adult woman stays entirely on the RIGHT of the frame and performs two small easy rhythmic side steps, softly bending her knees, shifting her weight and moving her arms in time, smiling naturally and enjoying her training. Believable controlled exercise, never jumping unnaturally. Locked-off wide camera, preserve full body, proportions, hands, clothing and warm light. The LEFT HALF stays empty dark neutral grey for readable HTML text. Return gently to the original starting pose and framing for a clean loop. No camera cuts, no zoom, no other people appearing, no logos, no captions, no sound.',
        duration: 6, resolution: '1080p', output_format: 'mp4', generate_audio: false,
      },
      withPolling: true,
    });
    if (clip.status !== 'completed') throw new Error('NotCompleted');
    await download(clip.video?.url, videoAsset);
    await writeFile(new URL('hero-video.json', directory), JSON.stringify({ model: 'bytedance/seedance-2.5/image-to-video', requestId: clip.request_id, status: clip.status, duration: 6 }, null, 2));
  }
  console.log('Campaign completed: ten photographs and one silent hero film.');
} catch (error: unknown) {
  // Raw SDK errors can contain authorization headers. Only safe names are reported.
  const name = error instanceof Error ? error.name : 'UnknownError';
  const internal = error instanceof Error && ['MissingOutput', 'DownloadError', 'NotCompleted', 'UnverifiedExistingJob'].includes(error.message) ? error.message : name;
  const reasons: Record<string, string> = {
    AuthenticationError: 'Higgsfield authentication rejected.',
    NotEnoughCreditsError: 'Insufficient Higgsfield API credits.',
    AccountError: 'Higgsfield API account rejected the request.',
    ValidationError: 'The API rejected the documented parameters.',
    BadInputError: 'The API rejected the input.',
    TimeoutError: 'Polling timed out. The submitted job must be checked before resubmission.',
    MissingOutput: 'No usable generated asset was returned.',
    DownloadError: 'A completed asset could not be downloaded.',
    NotCompleted: 'Generation did not reach completed status.',
    UnverifiedExistingJob: 'An existing submission has not been verified. No duplicate request was submitted.',
  };
  const reason = reasons[internal] ?? 'Campaign generation failed. Existing media has been preserved.';
  console.error(reason);
  await writeFile(new URL('status.json', directory), JSON.stringify({ status: 'blocked', reason, completedImages: manifest.length }, null, 2));
  process.exitCode = 1;
}
