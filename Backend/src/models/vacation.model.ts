import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { Vacation, VacationWithLikes } from "../types/index.js";

interface VacationRow extends RowDataPacket, Vacation {}

export type VacationFilter = "all" | "liked" | "active" | "notStarted";

interface GetVacationsOptions {
  userId: number;
  filter: VacationFilter;
  page: number;
  limit: number;
}

export interface PaginatedVacations {
  items: VacationWithLikes[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Build the WHERE clause + params shared by the list and count queries. */
function buildFilterClause(
  filter: VacationFilter,
  userId: number
): { clause: string; params: unknown[] } {
  switch (filter) {
    case "liked":
      return {
        clause:
          "WHERE v.vacation_id IN (SELECT vacation_id FROM likes WHERE user_id = ?)",
        params: [userId],
      };
    case "active":
      return { clause: "WHERE CURDATE() BETWEEN v.start_date AND v.end_date", params: [] };
    case "notStarted":
      return { clause: "WHERE v.start_date > CURDATE()", params: [] };
    case "all":
    default:
      return { clause: "", params: [] };
  }
}

export async function getVacations(
  opts: GetVacationsOptions
): Promise<PaginatedVacations> {
  const { userId, filter, page, limit } = opts;
  const offset = (page - 1) * limit;
  const { clause, params } = buildFilterClause(filter, userId);

  const listSql = `
    SELECT
      v.vacation_id, v.destination, v.description, v.start_date, v.end_date,
      v.price, v.image_filename,
      (SELECT COUNT(*) FROM likes l WHERE l.vacation_id = v.vacation_id) AS likes_count,
      EXISTS(
        SELECT 1 FROM likes l2
        WHERE l2.vacation_id = v.vacation_id AND l2.user_id = ?
      ) AS is_liked
    FROM vacations v
    ${clause}
    ORDER BY v.start_date ASC
    LIMIT ? OFFSET ?`;

  const [rows] = await pool.query<(VacationRow & RowDataPacket)[]>(listSql, [
    userId,
    ...params,
    limit,
    offset,
  ]);

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM vacations v ${clause}`,
    params
  );
  const total = Number(countRows[0]?.total ?? 0);

  const items: VacationWithLikes[] = rows.map((r) => ({
    vacation_id: r.vacation_id,
    destination: r.destination,
    description: r.description,
    start_date: r.start_date,
    end_date: r.end_date,
    price: Number(r.price),
    image_filename: r.image_filename,
    likes_count: Number((r as unknown as { likes_count: number }).likes_count),
    is_liked: Boolean((r as unknown as { is_liked: number }).is_liked),
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getVacationById(id: number): Promise<Vacation | null> {
  const [rows] = await pool.query<VacationRow[]>(
    "SELECT * FROM vacations WHERE vacation_id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return { ...row, price: Number(row.price) };
}

export interface VacationInput {
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  price: number;
  image_filename: string;
}

export async function createVacation(input: VacationInput): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO vacations
       (destination, description, start_date, end_date, price, image_filename)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.destination,
      input.description,
      input.start_date,
      input.end_date,
      input.price,
      input.image_filename,
    ]
  );
  return result.insertId;
}

export async function updateVacation(
  id: number,
  input: VacationInput
): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE vacations
       SET destination = ?, description = ?, start_date = ?, end_date = ?,
           price = ?, image_filename = ?
     WHERE vacation_id = ?`,
    [
      input.destination,
      input.description,
      input.start_date,
      input.end_date,
      input.price,
      input.image_filename,
      id,
    ]
  );
  return result.affectedRows > 0;
}

export async function deleteVacation(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM vacations WHERE vacation_id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

/** Likes-per-destination, used by the admin Reports page. */
export async function getLikesReport(): Promise<
  { destination: string; likes_count: number }[]
> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT v.destination,
            COUNT(l.user_id) AS likes_count
     FROM vacations v
     LEFT JOIN likes l ON l.vacation_id = v.vacation_id
     GROUP BY v.vacation_id, v.destination
     ORDER BY likes_count DESC, v.destination ASC`
  );
  return rows.map((r) => ({
    destination: String(r.destination),
    likes_count: Number(r.likes_count),
  }));
}
