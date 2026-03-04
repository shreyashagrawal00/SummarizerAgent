import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const summarizeNews = async (articles) => {
  if (!articles || articles.length === 0) return "No information to summarize.";

  const content = articles
    .map(a => `${a.title}: ${a.description || a.content || ""}`)
    .join("\n");

  const prompt = `Summarize the following news articles into a concise, professional summary. Focus on the key themes and most important updates:\n\n${content}`;

  return summarizeText(prompt);
};

export const summarizePDFText = async (text) => {
  if (!text || text.trim().length === 0) return "No document content found to summarize.";

  const prompt = `Provide a comprehensive yet concise executive summary of the following document content. Extract the most critical points, key findings, and action items if any:\n\n${text}`;

  return summarizeText(prompt);
};

const summarizeText = async (prompt) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const models = [
    "google/gemma-3-12b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "google/gemma-2-9b-it:free"
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Trying OpenRouter model: ${model}`);
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5001",
            "X-Title": "SummarizerAgent",
          },
        }
      );

      const text = response.data?.choices?.[0]?.message?.content;
      if (!text) throw new Error(`Empty response from ${model}`);

      console.log(`Success with OpenRouter AI (${model})`);
      return text;
    } catch (error) {
      console.error(`Error with model ${model}:`, error.response?.data?.error?.message || error.message);
      lastError = error;
      // If it's a 429 Rate Limit, or something else failed, try the next model
      // Only continue if we have more models to try
    }
  }

  // If all models failed, throw the last error
  console.error("All OpenRouter models failed. Last error:", lastError.response?.data || lastError.message);
  throw new Error(lastError.response?.data?.error?.message || lastError.message || "Summarization failed on all models");
};