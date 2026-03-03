import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5001",
    "X-Title": "SummarizerAgent",
  },
});

// Models tried in order — confirmed working on this OpenRouter key
const MODELS = [
  "openai/gpt-4o-mini",
  "openai/gpt-3.5-turbo",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

export const summarizeNews = async (articles) => {
  if (!articles || articles.length === 0) return "No information to summarize.";

  const content = articles
    .map(a => `${a.title}: ${a.description || a.content || ""}`)
    .join("\n");

  const prompt = `Summarize the following news articles into a concise, professional summary. Focus on the key themes and most important updates:\n\n${content}`;

  let lastError;
  let quotaExceeded = false;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const completion = await openrouter.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
      });

      const text = completion.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from model");

      console.log(`Success with model: ${modelName}`);
      return text;
    } catch (error) {
      const status = error.status || error.response?.status;
      console.error(`Model ${modelName} failed (${status}):`, error.message?.substring(0, 120));
      lastError = error;

      if (status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
        quotaExceeded = true;
        continue;
      }
      // For 404 (model unavailable) or other errors, try next
      continue;
    }
  }

  console.error("All models failed. Last error:", lastError?.message);

  if (quotaExceeded) {
    const quotaErr = new Error("quota");
    quotaErr.status = 429;
    throw quotaErr;
  }

  throw lastError;
};