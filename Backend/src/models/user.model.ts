import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { User, PublicUser, Role } from "../types/index.js";

interface UserRow extends RowDataPacket, User {}

export async function findByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] ?? null;
}

export async function findById(userId: number): Promise<User | null> {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT * FROM users WHERE user_id = ? LIMIT 1",
    [userId]
  );
  return rows[0] ?? null;
}

export async function emailExists(email: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT 1 FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows.length > 0;
}

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const role: Role = input.role ?? "user";
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
    [input.first_name, input.last_name, input.email, input.passwordHash, role]
  );
  return {
    user_id: result.insertId,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    role,
  };
}

export async function countUsers(): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM users"
  );
  return Number(rows[0]?.total ?? 0);
}
