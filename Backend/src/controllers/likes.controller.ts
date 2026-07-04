import type { Response } from "express";
import * as likeModel from "../models/like.model.js";
import { badRequest, notFound } from "../utils/http-error.js";
import type { AuthRequest } from "../types/index.js";

export async function addLike(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const vacationId = Number(req.params.vacationId);
  if (!Number.isInteger(vacationId)) throw badRequest("Invalid vacation id");
  if (!(await likeModel.vacationExists(vacationId))) {
    throw notFound("Vacation not found");
  }
  await likeModel.addLike(userId, vacationId);
  res.status(201).json({ message: "Liked" });
}

export async function removeLike(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const vacationId = Number(req.params.vacationId);
  if (!Number.isInteger(vacationId)) throw badRequest("Invalid vacation id");
  await likeModel.removeLike(userId, vacationId);
  res.json({ message: "Unliked" });
}
