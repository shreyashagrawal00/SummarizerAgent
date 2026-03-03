import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("API Key prefix:", process.env.GEMINI_API_KEY?.substring(0, 15) + "...");

const MODELS = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"];

for (const modelName of MODELS) {
  try {
    console.log(`\nTrying model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello in one word');
    console.log(`✅ SUCCESS with ${modelName}:`, result.response.text());
    break;
  } catch (e) {
    console.error(`❌ ${modelName} failed - status: ${e.status}, message: ${e.message?.substring(0, 200)}`);
  }
}
