import type { Request, Response } from "express";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, AI_MODEL } from "../utils/anthropic.js";
import { aiRecommendSchema, validate } from "../utils/validation.js";

export async function recommend(req: Request, res: Response): Promise<void> {
  const { destination } = validate(aiRecommendSchema, req.body);
  const anthropic = getAnthropic();

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 900,
    system:
      "You are an enthusiastic, knowledgeable travel advisor. Given a destination, " +
      "write a concise, practical recommendation (about 150-220 words). Cover: why to " +
      "visit, top 3-4 attractions, the best season to go, and one local food to try. " +
      "Use short paragraphs. Do not use markdown headers.",
    messages: [
      {
        role: "user",
        content: `Give me a travel recommendation for: ${destination}`,
      },
    ],
  });

  const recommendation = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  res.json({ destination, recommendation });
}
