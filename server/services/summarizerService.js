import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const summarizeWithOpenRouter = async (prompt) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

  // Best available models on OpenRouter (ordered by quality/reliability)
  const models = [
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "google/gemma-3-12b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
  ];

  for (const model of models) {
    try {
      console.log(`Trying OpenRouter model: ${model}`);
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5001",
            "X-Title": "SummarizerAgent",
          },
          timeout: 30000,
        }
      );

      const text = response.data?.choices?.[0]?.message?.content;
      if (!text) throw new Error(`Empty response from ${model}`);

      console.log(`Success with OpenRouter model: ${model}`);
      return text;
    } catch (error) {
      console.error(`OpenRouter model ${model} failed:`, error.response?.data?.error?.message || error.message);
    }
  }
  throw new Error("All OpenRouter models failed");
};

const summarizeWithGemini = async (prompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  console.log("Falling back to Gemini 2.0 Flash...");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  console.log("Success with Gemini 2.0 Flash");
  return text;
};

const summarizeText = async (prompt) => {
  // Try OpenRouter first (multiple models), then fall back to Gemini
  try {
    return await summarizeWithOpenRouter(prompt);
  } catch (openRouterError) {
    console.warn("OpenRouter failed, trying Gemini fallback:", openRouterError.message);
    try {
      return await summarizeWithGemini(prompt);
    } catch (geminiError) {
      console.error("Gemini also failed:", geminiError.message);
      throw new Error(`Summarization failed. OpenRouter: ${openRouterError.message}. Gemini: ${geminiError.message}`);
    }
  }
};