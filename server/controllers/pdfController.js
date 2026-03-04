import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import { summarizePDFText } from "../services/summarizerService.js";

export const summarizePDF = async (req, res) => {
  console.log("PDF Upload: Received request");
  try {
    if (!req.file) {
      console.warn("PDF Upload: No file in request");
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    console.log(`PDF Upload: Processing ${req.file.originalname} (${req.file.size} bytes)`);

    // Extract text from PDF buffer
    // pdf-parse is a CommonJS module that returns a function
    const data = await pdf(req.file.buffer);
    const text = data.text;

    console.log(`PDF Upload: Extracted ${text?.length || 0} characters`);

    if (!text || text.trim().length === 0) {
      console.warn("PDF Upload: No text extracted");
      return res.status(400).json({ message: "Could not extract text from PDF. It might be an image-only PDF." });
    }

    // Limit text size to avoid token issues (approx 15k chars for now)
    const truncatedText = text.substring(0, 15000);
    console.log("PDF Upload: Sending to Gemini summarizer...");

    const summary = await summarizePDFText(truncatedText);

    console.log("PDF Upload: Summary generated successfully");
    res.json({ summary });
  } catch (error) {
    console.error("PDF Processing Error:", error);
    res.status(500).json({ message: `PDF Error: ${error.message || "Failed to process PDF"}` });
  }
};
