import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const summarizeNews = async (articles, language = "en") => {
  if (!articles || articles.length === 0) return "No information to summarize.";

  const content = articles
    .map((a) => `${a.title}: ${a.description || a.content || ""}`)
    .join("\n");

  const prompt = `Summarize the following news articles into a concise, professional summary. Focus on the key themes and most important updates:${langInstruction(language)}\n\n${content}`;
  return summarizeText(prompt);
};

export const summarizePDFText = async (text, language = "en") => {
  if (!text?.trim()) return "No document content found to summarize.";
  const prompt = `Provide a comprehensive yet concise executive summary of the following document content. Extract the most critical points, key findings, and action items if any:${langInstruction(language)}\n\n${text}`;
  return summarizeText(prompt);
};

export const summarizeVideoText = async (text, language = "en") => {
  if (!text?.trim()) return "No video content found to summarize.";
  const prompt = `Summarize the following YouTube video transcript. Highlight the main topics discussed, key takeaways, and any important conclusions:${langInstruction(language)}\n\n${text}`;
  return summarizeText(prompt);
};

export const summarizeWebText = async (text, language = "en") => {
  if (!text?.trim()) return "No webpage content found to summarize.";
  const prompt = `Summarize the following text extracted from a webpage. Provide a clear overview of the article, identifying its main purpose and summarizing its key points:${langInstruction(language)}\n\n${text}`;
  return summarizeText(prompt);
};

export const askQuestion = async (
  contextText,
  question,
  language = "en",
  history = []
) => {
  if (!contextText?.trim()) return "I don't have enough context to answer that.";
  if (!question?.trim()) return "Please ask a specific question.";

  let historyStr = "";
  if (history?.length > 0) {
    historyStr =
      "Conversation History:\n" +
      history
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n") +
      "\n\n";
  }

  const prompt = `Use the following document text and the conversation history to answer the user's latest question accurately. If the answer cannot be reasonably inferred from the document text, politely state that you cannot find the answer in the provided document.\n\nDocument Text:\n${contextText}\n\n${historyStr}Latest Question:\n${question}${langInstruction(language)}`;
  return summarizeText(prompt);
};

// ─── Language helpers ────────────────────────────────────────────────────────

const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", mr: "Marathi",
  ta: "Tamil", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  pa: "Punjabi", or: "Odia", as: "Assamese", ur: "Urdu",
  es: "Spanish", fr: "French", de: "German", zh: "Chinese", ja: "Japanese",
};

const getLanguageName = (code) => LANGUAGE_NAMES[code] || "English";

const langInstruction = (language) =>
  language !== "en"
    ? `\n\nIMPORTANT: You MUST write your entire response in the following language: ${getLanguageName(language)}. Do not use English at all in your response.`
    : "";

// ─── AI providers ────────────────────────────────────────────────────────────

/**
 * FIX: Changed Nvidia model from "thudm/chatglm3-6b" (often unavailable/empty)
 * to "meta/llama-3.1-8b-instruct" which is reliably available on Nvidia NIM.
 * Also added an explicit guard against empty responses.
 */
const summarizeWithNvidia = async (prompt) => {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  if (!NVIDIA_API_KEY) throw new Error("NVIDIA_API_KEY not set");

  console.log("Using Nvidia AI provider...");
  const openai = new OpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  const completion = await openai.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    top_p: 1,
    max_tokens: 1024,
  });

  const text = completion.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from Nvidia AI");

  console.log("Success with Nvidia AI");
  return text;
};

const summarizeWithOpenRouter = async (prompt) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

  const models = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "google/gemma-3-12b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
  ];

  for (const model of models) {
    try {
      console.log(`Trying OpenRouter model: ${model}`);
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages: [{ role: "user", content: prompt }] },
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

      const text = response.data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error(`Empty response from ${model}`);

      console.log(`Success with OpenRouter model: ${model}`);
      return text;
    } catch (error) {
      console.error(
        `OpenRouter model ${model} failed:`,
        error.response?.data?.error?.message || error.message
      );
    }
  }
  throw new Error("All OpenRouter models failed");
};

const summarizeWithGemini = async (prompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  console.log("Falling back to Gemini Flash...");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text()?.trim();
  if (!text) throw new Error("Empty response from Gemini");
  console.log("Success with Gemini Flash");
  return text;
};

const summarizeText = async (prompt) => {
  try {
    return await summarizeWithNvidia(prompt);
  } catch (nvidiaError) {
    console.warn("Nvidia failed, trying OpenRouter:", nvidiaError.message);
    try {
      return await summarizeWithOpenRouter(prompt);
    } catch (openRouterError) {
      console.warn("OpenRouter failed, trying Gemini:", openRouterError.message);
      try {
        return await summarizeWithGemini(prompt);
      } catch (geminiError) {
        console.error("All AI providers failed:", geminiError.message);
        throw new Error(
          `Summarization failed. Nvidia: ${nvidiaError.message}. OpenRouter: ${openRouterError.message}. Gemini: ${geminiError.message}`
        );
      }
    }
  }
};