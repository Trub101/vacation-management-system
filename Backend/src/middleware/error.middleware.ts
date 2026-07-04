import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "../utils/http-error.js";

/** Pull the human-readable message out of an Anthropic API error body. */
function anthropicMessage(err: InstanceType<typeof Anthropic.APIError>): string {
  const body = err.error as { error?: { message?: string } } | undefined;
  return body?.error?.message || err.message || "AI request failed";
}

/** 404 handler for unmatched routes. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found" });
}

/** Global error handler — every error returns `{ message }`. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err instanceof Anthropic.APIError) {
    res.status(err.status ?? 502).json({ message: anthropicMessage(err) });
    return;
  }
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image is too large (max 5 MB)"
        : err.message;
    res.status(400).json({ message });
    return;
  }
  console.error("[Unhandled error]", err);
  const message =
    err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ message });
}
