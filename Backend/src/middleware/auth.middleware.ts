import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { verifyToken } from "../utils/jwt.utils.js";
import { unauthorized } from "../utils/http-error.js";

/** Requires a valid `Authorization: Bearer <token>` header. */
export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(unauthorized("Authentication required"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
}
