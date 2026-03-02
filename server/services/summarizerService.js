import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

export const summarizeNews = async (articles) => {
  if (!articles || articles.length === 0) return "No information to summarize.";

  const content = articles
    .map(a => `${a.title}: ${a.description || a.content || ""}`)
    .join("\n");

  const prompt = `Summarize the following news articles into a concise, professional summary. Focus on the key themes and most important updates:\n\n${content}`;

  let lastError;
  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(`Success with model: ${modelName}`);
      return response.text();
    } catch (error) {
      console.error(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // If it's a rate limit error, try the next model
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        continue;
      }
      // For other errors, still try next model
      continue;
    }
  }

  console.error("All models failed. Last error:", lastError);
  throw lastError;
};