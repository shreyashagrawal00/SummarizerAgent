import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// ─── Public API ───────────────────────────────────────────────────────────────

export const summarizeNews = async (articles, language = "en") => {
  if (!articles?.length) return "No information to summarize.";
  const content = articles
    .map((a) => `${a.title}: ${a.description || a.content || ""}`)
    .join("\n");
  return summarizeText(
    `Summarize the following news articles into a concise, professional summary. Focus on key themes and the most important updates:${langInstruction(language)}\n\n${content}`
  );
};

export const summarizePDFText = async (text, language = "en") => {
  if (!text?.trim()) return "No document content found to summarize.";
  return summarizeText(
    `Provide a comprehensive yet concise executive summary of the following document. Extract the most critical points, key findings, and action items:${langInstruction(language)}\n\n${text}`
  );
};

export const summarizeVideoText = async (text, language = "en") => {
  if (!text?.trim()) return "No video content found to summarize.";
  return summarizeText(
    `Summarize the following YouTube video transcript. Highlight the main topics discussed, key takeaways, and any important conclusions:${langInstruction(language)}\n\n${text}`
  );
};

export const summarizeWebText = async (text, language = "en") => {
  if (!text?.trim()) return "No webpage content found to summarize.";
  return summarizeText(
    `Summarize the following webpage content. Provide a clear overview identifying its main purpose and key points:${langInstruction(language)}\n\n${text}`
  );
};

export const askQuestion = async (contextText, question, language = "en", history = []) => {
  if (!contextText?.trim()) return "I don't have enough context to answer that.";
  if (!question?.trim()) return "Please ask a specific question.";
  const historyStr =
    history?.length > 0
      ? "Conversation History:\n" +
        history
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n") +
        "\n\n"
      : "";
  return summarizeText(
    `Use the following document and conversation history to answer the user's question. If the answer is not in the document, say so politely.\n\nDocument:\n${contextText}\n\n${historyStr}Question:\n${question}${langInstruction(language)}`
  );
};

// ─── Language helpers ─────────────────────────────────────────────────────────

const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", mr: "Marathi",
  ta: "Tamil", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  pa: "Punjabi", or: "Odia", as: "Assamese", ur: "Urdu",
  es: "Spanish", fr: "French", de: "German", zh: "Chinese", ja: "Japanese",
};

const langInstruction = (lang) =>
  lang !== "en"
    ? `\n\nIMPORTANT: Respond entirely in ${LANGUAGE_NAMES[lang] || "English"}. Do not use English.`
    : "";

// ─── AI providers ─────────────────────────────────────────────────────────────

// Provider 1: Nvidia NIM
// FIX: was using "thudm/chatglm3-6b" (often unavailable) → now "meta/llama-3.1-8b-instruct"
// FIX: added 20s timeout so a dead endpoint doesn't stall the fallback chain
const summarizeWithNvidia = async (prompt) => {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  if (!NVIDIA_API_KEY) throw new Error("NVIDIA_API_KEY not set");
  console.log("AI: trying Nvidia...");
  const openai = new OpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
    timeout: 20000,
  });
  const completion = await openai.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1024,
  });
  const text = completion.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from Nvidia");
  console.log("AI: Nvidia success");
  return text;
};

// Provider 2: Gemini Flash (fast, reliable, free tier available)
// FIX: Moved to position 2 (before OpenRouter) — much faster than cycling 5 OpenRouter models
const summarizeWithGemini = async (prompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
  console.log("AI: trying Gemini Flash...");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout after 25s")), 25000)
    ),
  ]);
  const text = result.response.text()?.trim();
  if (!text) throw new Error("Empty response from Gemini");
  console.log("AI: Gemini success");
  return text;
};

// Provider 3: OpenRouter (free fallback, tries multiple models)
const summarizeWithOpenRouter = async (prompt) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");
  const models = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-3-12b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
  ];
  for (const model of models) {
    try {
      console.log(`AI: trying OpenRouter ${model}...`);
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
          timeout: 25000,
        }
      );
      const text = response.data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error(`Empty response from ${model}`);
      console.log(`AI: OpenRouter ${model} success`);
      return text;
    } catch (err) {
      console.warn(
        `OpenRouter ${model} failed:`,
        err.response?.data?.error?.message || err.message
      );
    }
  }
  throw new Error("All OpenRouter models failed");
};

// ─── Main dispatcher ──────────────────────────────────────────────────────────
// Order: Gemini → OpenRouter → Nvidia
// Skips providers with no key immediately — no wasted timeout waiting
const summarizeText = async (prompt) => {
  if (process.env.GEMINI_API_KEY) {
    try { return await summarizeWithGemini(prompt); }
    catch (err) { console.warn("Gemini failed:", err.message); }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try { return await summarizeWithOpenRouter(prompt); }
    catch (err) { console.warn("OpenRouter failed:", err.message); }
  }

  if (process.env.NVIDIA_API_KEY) {
    try { return await summarizeWithNvidia(prompt); }
    catch (err) { console.warn("Nvidia failed:", err.message); }
  }

  throw new Error(
    "No AI provider succeeded. Please check GEMINI_API_KEY, OPENROUTER_API_KEY, or NVIDIA_API_KEY in your environment."
  );
};