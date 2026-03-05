import 'dotenv/config';
import { summarizeNews } from './services/summarizerService.js';

async function test() {
  try {
    console.log("Starting summarization test...");
    const res = await summarizeNews([{ title: "Test Title", content: "This is a test of the summarization API." }]);
    console.log("Success:", res);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
test();
