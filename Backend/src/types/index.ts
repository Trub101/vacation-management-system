import type { Request } from "express";

export type Role = "user" | "admin";

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: Role;
}

export type PublicUser = Omit<User, "password">;

export interface Vacation {
  vacation_id: number;
  destination: string;
  description: string;
  start_date: string; // ISO date (YYYY-MM-DD)
  end_date: string;
  price: number;
  image_filename: string;
}

export interface VacationWithLikes extends Vacation {
  likes_count: number;
  is_liked: boolean;
}

export interface JWTPayload {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

/** Express request that has passed the auth middleware. */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
