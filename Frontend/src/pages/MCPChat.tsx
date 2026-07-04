import { useState } from "react";
import { toast } from "react-toastify";
import * as aiService from "../services/ai.service";
import { getErrorMessage } from "../api/client";

const EXAMPLES = [
  "How many vacations are active right now?",
  "What is the average vacation price?",
  "Show me future vacations in Italy",
  "Which vacations have the most likes?",
  "How many users are registered?",
  "Search for beach vacations",
];

export default function MCPChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    const value = q.trim();
    if (!value) {
      toast.warn("Type a question first");
      return;
    }
    setLoading(true);
    setAnswer("");
    try {
      const res = await aiService.askMcp(value);
      setAnswer(res);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not answer that"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>MCP Database Chat</h1>
      <p className="subtitle">
        Ask anything about the vacations data — Claude queries the database live via MCP tools.
      </p>

      <div className="ai-box">
        <div className="chips">
          {EXAMPLES.map((e) => (
            <button key={e} className="chip" onClick={() => { setQuestion(e); ask(e); }}>
              {e}
            </button>
          ))}
        </div>

        <div className="ai-input-row">
          <input
            value={question}
            placeholder="Ask about vacations, prices, likes, users…"
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(question)}
          />
          <button className="btn" onClick={() => ask(question)} disabled={loading}>
            {loading ? "Querying…" : "Ask"}
          </button>
        </div>

        {loading ? (
          <div className="ai-answer">
            <span className="loading-row"><span className="spinner" /> Querying the database…</span>
          </div>
        ) : answer ? (
          <div className="ai-answer">{answer}</div>
        ) : (
          <div className="ai-answer" style={{ color: "var(--muted)" }}>
            The answer will appear here. Try one of the example questions above.
          </div>
        )}
      </div>
    </div>
  );
}
