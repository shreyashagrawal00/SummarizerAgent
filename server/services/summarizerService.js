import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Empty response from Gemini AI");

    console.log("Success with Gemini AI");
    return text;
  } catch (error) {
    console.error("Gemini AI Summarization Error:", error);
    throw error;
  }
};