import type { Request, Response } from "express";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, AI_MODEL } from "../utils/anthropic.js";
import { connectMcpClient } from "../mcp/mcp-server.js";
import { mcpQuerySchema, validate } from "../utils/validation.js";

const SYSTEM_PROMPT =
  "You are a helpful data assistant for a vacation booking platform. Answer the " +
  "user's question about the vacations database by calling the available tools. " +
  "Only rely on tool results — never invent numbers. Reply in clear, friendly " +
  "natural language (not JSON), and include the concrete figures you retrieved.";

const MAX_TURNS = 6;

export async function query(req: Request, res: Response): Promise<void> {
  const { question } = validate(mcpQuerySchema, req.body);
  const anthropic = getAnthropic();
  const client = await connectMcpClient();

  try {
    const { tools } = await client.listTools();
    const anthropicTools: Anthropic.Tool[] = tools.map((t) => ({
      name: t.name,
      description: t.description ?? "",
      input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
    }));

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: question },
    ];

    let answer = "";

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: anthropicTools,
        messages,
      });

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use") {
        answer = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        break;
      }

      // Execute every tool Claude requested this turn.
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const result = await client.callTool({
          name: block.name,
          arguments: (block.input ?? {}) as Record<string, unknown>,
        });
        const content = Array.isArray(result.content) ? result.content : [];
        const text = content
          .map((c) => (c.type === "text" ? c.text : ""))
          .join("");
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: text,
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    if (!answer) {
      answer =
        "I couldn't produce an answer for that question. Try rephrasing it.";
    }
    res.json({ question, answer });
  } finally {
    await client.close();
  }
}
