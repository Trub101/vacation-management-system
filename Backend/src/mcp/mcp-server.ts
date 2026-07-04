import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import { pool } from "../config/db.js";

/** Helper: wrap any JSON-serialisable value as an MCP text tool-result. */
function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

/**
 * Map a continent / region keyword to concrete country keywords so questions
 * like "future vacations in Europe" match the country-based destinations.
 */
const REGION_KEYWORDS: Record<string, string[]> = {
  europe: ["France", "Italy", "Spain", "Netherlands", "Czech", "Greece", "Portugal", "Germany", "England", "Ireland", "Austria"],
  european: ["France", "Italy", "Spain", "Netherlands", "Czech", "Greece", "Portugal", "Germany", "England", "Ireland", "Austria"],
  asia: ["Japan", "Indonesia", "Thailand", "China", "India", "Vietnam", "Bali"],
  asian: ["Japan", "Indonesia", "Thailand", "China", "India", "Vietnam", "Bali"],
  america: ["USA", "United States", "Mexico", "Brazil", "Canada", "Argentina"],
  americas: ["USA", "United States", "Mexico", "Brazil", "Canada", "Argentina"],
  "north america": ["USA", "United States", "Mexico", "Canada"],
  "south america": ["Brazil", "Argentina", "Peru", "Chile", "Colombia"],
  oceania: ["Australia", "Sydney", "New Zealand"],
  "middle east": ["UAE", "Dubai", "Israel", "Qatar", "Jordan"],
  africa: ["Egypt", "Morocco", "South Africa", "Kenya", "Tanzania"],
};

/** Return the list of keywords to search for a given region query. */
function expandRegion(region: string): string[] {
  const key = region.trim().toLowerCase();
  return REGION_KEYWORDS[key] ?? [region];
}

/**
 * Build the custom MCP server. It exposes six read-only tools that run real
 * SQL queries against the vacations database.
 */
export function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: "vacations-db-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "get_active_vacations_count",
    {
      description:
        "Get the count of currently active vacations (already started but not yet ended).",
      inputSchema: {},
    },
    async () => {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS count FROM vacations WHERE CURDATE() BETWEEN start_date AND end_date"
      );
      return textResult({ active_vacations: Number(rows[0]?.count ?? 0) });
    }
  );

  server.registerTool(
    "get_average_vacation_price",
    {
      description: "Get the average price of all vacations, in USD.",
      inputSchema: {},
    },
    async () => {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT AVG(price) AS avg_price FROM vacations"
      );
      const avg = rows[0]?.avg_price;
      return textResult({
        average_price: avg == null ? 0 : Number(Number(avg).toFixed(2)),
      });
    }
  );

  server.registerTool(
    "get_future_vacations_by_region",
    {
      description:
        "Get future vacations (start date after today) filtered by a region, country, or city keyword.",
      inputSchema: {
        region: z
          .string()
          .describe("Region / country / city keyword, e.g. 'Italy' or 'Asia'"),
      },
    },
    async ({ region }) => {
      const keywords = expandRegion(region);
      const orClause = keywords.map(() => "destination LIKE ?").join(" OR ");
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT destination, start_date, end_date, price
         FROM vacations
         WHERE start_date > CURDATE() AND (${orClause})
         ORDER BY start_date ASC`,
        keywords.map((k) => `%${k}%`)
      );
      return textResult({
        region,
        matched_keywords: keywords,
        count: rows.length,
        vacations: rows,
      });
    }
  );

  server.registerTool(
    "get_vacations_with_likes",
    {
      description: "Get all vacations together with their like counts.",
      inputSchema: {},
    },
    async () => {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT v.destination,
                COUNT(l.user_id) AS likes_count
         FROM vacations v
         LEFT JOIN likes l ON l.vacation_id = v.vacation_id
         GROUP BY v.vacation_id, v.destination
         ORDER BY likes_count DESC`
      );
      return textResult({
        vacations: rows.map((r) => ({
          destination: r.destination,
          likes_count: Number(r.likes_count),
        })),
      });
    }
  );

  server.registerTool(
    "get_total_users_count",
    {
      description: "Get the total number of registered users.",
      inputSchema: {},
    },
    async () => {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS count FROM users"
      );
      return textResult({ total_users: Number(rows[0]?.count ?? 0) });
    }
  );

  server.registerTool(
    "search_vacations",
    {
      description:
        "Search vacations whose destination or description contains a keyword.",
      inputSchema: {
        keyword: z.string().describe("Search keyword, e.g. 'beach' or 'Paris'"),
      },
    },
    async ({ keyword }) => {
      const like = `%${keyword}%`;
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT destination, description, start_date, end_date, price
         FROM vacations
         WHERE destination LIKE ? OR description LIKE ?
         ORDER BY start_date ASC`,
        [like, like]
      );
      return textResult({ keyword, count: rows.length, vacations: rows });
    }
  );

  return server;
}

/**
 * Create an in-process MCP client already connected to our MCP server over an
 * in-memory transport. The Express bridge uses this client to list and call
 * tools on Claude's behalf.
 */
export async function connectMcpClient(): Promise<Client> {
  const server = buildMcpServer();
  const client = new Client({ name: "vacations-bridge", version: "1.0.0" });

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  return client;
}
