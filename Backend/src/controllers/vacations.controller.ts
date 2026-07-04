import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import * as vacationModel from "../models/vacation.model.js";
import type { VacationFilter, VacationInput } from "../models/vacation.model.js";
import { UPLOADS_DIR } from "../middleware/upload.middleware.js";
import {
  addVacationSchema,
  editVacationSchema,
  validate,
} from "../utils/validation.js";
import { badRequest, notFound } from "../utils/http-error.js";
import type { AuthRequest } from "../types/index.js";

const VALID_FILTERS: VacationFilter[] = ["all", "liked", "active", "notStarted"];

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function localToday(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export async function listVacations(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const rawFilter = String(req.query.filter || "all");
  const filter: VacationFilter = VALID_FILTERS.includes(rawFilter as VacationFilter)
    ? (rawFilter as VacationFilter)
    : "all";

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));

  const result = await vacationModel.getVacations({ userId, filter, page, limit });
  res.json(result);
}

export async function getVacation(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest("Invalid vacation id");
  const vacation = await vacationModel.getVacationById(id);
  if (!vacation) throw notFound("Vacation not found");
  res.json(vacation);
}

export async function addVacation(req: Request, res: Response): Promise<void> {
  if (!req.file) throw badRequest("A vacation image is required");

  const body = validate(addVacationSchema, req.body);

  // ADD-only rule: no past start date.
  if (fmt(body.start_date as unknown as Date) < localToday()) {
    fs.rmSync(path.join(UPLOADS_DIR, req.file.filename), { force: true });
    throw badRequest("Start date cannot be in the past");
  }

  const input: VacationInput = {
    destination: body.destination,
    description: body.description,
    start_date: fmt(body.start_date as unknown as Date),
    end_date: fmt(body.end_date as unknown as Date),
    price: body.price,
    image_filename: req.file.filename,
  };
  const id = await vacationModel.createVacation(input);
  const created = await vacationModel.getVacationById(id);
  res.status(201).json(created);
}

export async function editVacation(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest("Invalid vacation id");

  const existing = await vacationModel.getVacationById(id);
  if (!existing) throw notFound("Vacation not found");

  const body = validate(editVacationSchema, req.body);
  // EDIT allows past dates; only image is optional.
  const image_filename = req.file ? req.file.filename : existing.image_filename;

  const input: VacationInput = {
    destination: body.destination,
    description: body.description,
    start_date: fmt(body.start_date as unknown as Date),
    end_date: fmt(body.end_date as unknown as Date),
    price: body.price,
    image_filename,
  };
  await vacationModel.updateVacation(id, input);

  // Remove the old image file if it was replaced.
  if (req.file && existing.image_filename !== image_filename) {
    fs.rmSync(path.join(UPLOADS_DIR, existing.image_filename), { force: true });
  }

  const updated = await vacationModel.getVacationById(id);
  res.json(updated);
}

export async function removeVacation(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest("Invalid vacation id");

  const existing = await vacationModel.getVacationById(id);
  if (!existing) throw notFound("Vacation not found");

  await vacationModel.deleteVacation(id);
  fs.rmSync(path.join(UPLOADS_DIR, existing.image_filename), { force: true });
  res.json({ message: "Vacation deleted" });
}

export function serveImage(req: Request, res: Response): void {
  const filename = path.basename(String(req.params.filename)); // prevent path traversal
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: "Image not found" });
    return;
  }
  res.sendFile(filePath);
}

export async function likesReport(_req: Request, res: Response): Promise<void> {
  const report = await vacationModel.getLikesReport();
  res.json(report);
}
