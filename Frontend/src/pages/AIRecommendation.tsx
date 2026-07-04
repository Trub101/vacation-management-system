import { useState } from "react";
import { toast } from "react-toastify";
import * as aiService from "../services/ai.service";
import { getErrorMessage } from "../api/client";

const IDEAS = ["Iceland", "Kyoto, Japan", "Amalfi Coast", "Patagonia", "Marrakech"];

export default function AIRecommendation() {
  const [destination, setDestination] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (dest: string) => {
    const value = dest.trim();
    if (!value) {
      toast.warn("Enter a destination first");
      return;
    }
    setLoading(true);
    setAnswer("");
    try {
      const rec = await aiService.getRecommendation(value);
      setAnswer(rec);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not get a recommendation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>AI Travel Recommendation</h1>
      <p className="subtitle">
        Powered by Claude — type a destination and get a tailored travel guide.
      </p>

      <div className="ai-box">
        <div className="chips">
          {IDEAS.map((i) => (
            <button key={i} className="chip" onClick={() => { setDestination(i); ask(i); }}>
              {i}
            </button>
          ))}
        </div>

        <div className="ai-input-row">
          <input
            value={destination}
            placeholder="e.g. Lisbon, Portugal"
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(destination)}
          />
          <button className="btn" onClick={() => ask(destination)} disabled={loading}>
            {loading ? "Thinking…" : "Get Recommendation"}
          </button>
        </div>

        {loading ? (
          <div className="ai-answer">
            <span className="loading-row"><span className="spinner" /> Crafting your travel guide…</span>
          </div>
        ) : answer ? (
          <div className="ai-answer">{answer}</div>
        ) : (
          <div className="ai-answer" style={{ color: "var(--muted)" }}>
            Your recommendation will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
