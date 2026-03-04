import { summarizePDFText } from './services/summarizerService.js';
import "dotenv/config";

async function test() {
  try {
    console.log("Starting summarization test...");
    const result = await summarizePDFText("This document describes the water cycle. Water evaporates from oceans, forms clouds through condensation, and falls back as rain or snow (precipitation). It then flows into rivers and oceans or is absorbed by soil, restarting the cycle. This cycle is crucial for distributing fresh water and regulating Earth's temperature.");
    console.log("\n--- Summary ---\n", result);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}
test();
