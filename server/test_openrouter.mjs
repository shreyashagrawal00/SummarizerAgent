import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Test several models to find which ones work with this key
const MODELS = [
  "openai/gpt-4o-mini",
  "openai/gpt-3.5-turbo",
  "google/gemini-flash-1.5",
  "google/gemini-flash-1.5:free",
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-chat:free",
  "anthropic/claude-3-haiku",
];

for (const model of MODELS) {
  try {
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Say hi in one word" }],
      max_tokens: 10,
    });
    console.log(`✅ ${model}:`, res.choices?.[0]?.message?.content?.trim());
    break; // Stop at first success to save quota
  } catch (e) {
    console.log(`❌ ${model}: ${e.status} - ${e.message?.substring(0, 80)}`);
  }
}
