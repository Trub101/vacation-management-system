import { api } from "../api/client";

export async function getRecommendation(destination: string): Promise<string> {
  const { data } = await api.post<{ destination: string; recommendation: string }>(
    "/ai/recommend",
    { destination }
  );
  return data.recommendation;
}

export async function askMcp(question: string): Promise<string> {
  const { data } = await api.post<{ question: string; answer: string }>(
    "/mcp/query",
    { question }
  );
  return data.answer;
}
