import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as userModel from "../models/user.model.js";
import { signToken } from "../utils/jwt.utils.js";
import { registerSchema, loginSchema, validate } from "../utils/validation.js";
import { conflict, unauthorized } from "../utils/http-error.js";
import type { JWTPayload, PublicUser } from "../types/index.js";

const SALT_ROUNDS = 10;

function toPayload(user: {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin";
}): JWTPayload {
  return {
    userId: user.user_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = validate(registerSchema, req.body);

  if (await userModel.emailExists(body.email)) {
    throw conflict("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
  const user: PublicUser = await userModel.createUser({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    passwordHash,
    role: "user",
  });

  const token = signToken(toPayload(user));
  res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = validate(loginSchema, req.body);

  const user = await userModel.findByEmail(body.email);
  if (!user) throw unauthorized("Invalid email or password");

  const ok = await bcrypt.compare(body.password, user.password);
  if (!ok) throw unauthorized("Invalid email or password");

  const { password: _pw, ...publicUser } = user;
  const token = signToken(toPayload(user));
  res.json({ token, user: publicUser });
}

/** Real-time email availability check used by the Register form. */
export async function checkEmail(req: Request, res: Response): Promise<void> {
  const email = String(req.query.email || "").trim();
  const available = email.length > 0 && !(await userModel.emailExists(email));
  res.json({ available });
}
