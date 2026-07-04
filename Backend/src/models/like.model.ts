import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";

export async function addLike(userId: number, vacationId: number): Promise<void> {
  // INSERT IGNORE keeps the operation idempotent thanks to the PK (user_id, vacation_id).
  await pool.query<ResultSetHeader>(
    "INSERT IGNORE INTO likes (user_id, vacation_id) VALUES (?, ?)",
    [userId, vacationId]
  );
}

export async function removeLike(
  userId: number,
  vacationId: number
): Promise<void> {
  await pool.query<ResultSetHeader>(
    "DELETE FROM likes WHERE user_id = ? AND vacation_id = ?",
    [userId, vacationId]
  );
}

export async function vacationExists(vacationId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT 1 FROM vacations WHERE vacation_id = ? LIMIT 1",
    [vacationId]
  );
  return rows.length > 0;
}
