import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { forbidden } from "../utils/http-error.js";

/** Must run AFTER `authenticate`. Blocks non-admin users. */
export function requireAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "admin") {
    return next(forbidden("Admin access required"));
  }
  next();
}

/** Must run AFTER `authenticate`. Blocks admins from user-only actions (e.g. likes). */
export function requireUser(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "user") {
    return next(forbidden("This action is available to regular users only"));
  }
  next();
}
