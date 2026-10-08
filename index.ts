import { config as loadEnv } from "dotenv";
import { config, higgsfield } from "@higgsfield/client/v2";

async function main(): Promise<void> {
  // Resolve next to this server-side script, independent of the working directory.
  loadEnv({ path: new URL(".env.local", import.meta.url), quiet: true });
  if (!process.env.HF_CREDENTIALS || !/^[^:\s]+:[^:\s]+$/.test(process.env.HF_CREDENTIALS)) {
    console.error("Set HF_CREDENTIALS in .env.local using key-id:key-secret format.");
    process.exitCode = 1;
    return;
  }

  config({
    credentials: process.env.HF_CREDENTIALS,
    // Avoid retrying a billable submission if its response is lost.
    maxRetries: 0,
    maxPollTime: 30 * 60 * 1000,
  });

  console.error("Submitting Seedance 2.5 generation and waiting for completion...");
  const result = await higgsfield.subscribe("bytedance/seedance-2.5/text-to-video", {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  });

  // Check runtime statuses too: canceled/moderated are absent from SDK typings.
  const status: string = result.status;
  if (status !== "completed") {
    const reason = {
      failed: "Generation failed.",
      canceled: "Generation was canceled.",
      cancelled: "Generation was canceled.",
      nsfw: "Generation was blocked by moderation.",
      moderated: "Generation was blocked by moderation.",
    }[status] ?? "Generation did not complete.";
    console.error(reason);
    process.exitCode = 1;
    return;
  }

  const videoUrl = result.video?.url;
  if (!videoUrl || !URL.canParse(videoUrl) || !["https:", "http:"].includes(new URL(videoUrl).protocol)) {
    console.error("The completed response did not contain a valid video URL.");
    process.exitCode = 1;
    return;
  }
  console.log(videoUrl);
}

main().catch((error: unknown) => {
  // Never print raw SDK errors: HTTP errors can contain authorization headers.
  const name = error instanceof Error ? error.name : "";
  const messages: Record<string, string> = {
    AuthenticationError: "Authentication failed. Check the credential locally in .env.local.",
    NotEnoughCreditsError: "The API rejected access or available credits are insufficient.",
    AccountError: "The API rejected access or available credits are insufficient.",
    ValidationError: "The API rejected the request parameters.",
    BadInputError: "The API rejected the request input.",
    TimeoutError: "Polling timed out; completion is unverified. The request may still be running. Do not resubmit blindly.",
  };
  console.error(messages[name] ?? "The API request failed; generation was not verified.");
  if (typeof error === "object" && error !== null && "statusCode" in error
      && typeof error.statusCode === "number" && Number.isInteger(error.statusCode)) {
    console.error(`HTTP status: ${error.statusCode}`);
  }
  process.exitCode = 1;
});
