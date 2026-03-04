import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelsToTest = [
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("say hello in one sentence");
      console.log(`SUCCESS with ${modelName}:`, result.response.text());
    } catch (error) {
      console.error(`FAILED for ${modelName}:`, error.message.slice(0, 150));
    }
  }
}
test();
