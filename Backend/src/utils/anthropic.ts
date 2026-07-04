import Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "./http-error.js";

export const AI_MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

/** Lazily create the Anthropic client, or fail clearly if the key is missing. */
export function getAnthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === "PASTE_YOUR_ANTHROPIC_API_KEY_HERE") {
    throw new HttpError(
      503,
      "AI features are not configured. Set ANTHROPIC_API_KEY in Backend/.env."
    );
  }
  if (!client) client = new Anthropic({ apiKey: key });
  return client;
}
