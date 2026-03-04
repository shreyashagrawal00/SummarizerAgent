import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse, VerbosityLevel } = require("pdf-parse");

import { summarizePDFText } from "../services/summarizerService.js";

export const summarizePDF = async (req, res) => {
  console.log("PDF Upload: Received request");
  try {
    if (!req.file) {
      console.warn("PDF Upload: No file in request");
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    console.log(`PDF Upload: Processing ${req.file.originalname} (${req.file.size} bytes)`);

    // pdf-parse v2: pass buffer via { data: buffer } constructor option, then call getText()
    const parser = new PDFParse({
      data: req.file.buffer,
      verbosity: VerbosityLevel.ERRORS,
    });
    const result = await parser.getText();
    await parser.destroy();

    const text = result.text;
    console.log(`PDF Upload: Extracted ${text?.length || 0} characters`);

    if (!text || text.trim().length === 0) {
      console.warn("PDF Upload: No text extracted");
      return res.status(400).json({ message: "Could not extract text from PDF. It might be an image-only PDF." });
    }

    // Limit text size to avoid token issues (approx 15k chars)
    const truncatedText = text.substring(0, 15000);
    console.log("PDF Upload: Sending to AI summarizer...");

    const language = req.body?.language || "en";
    const summary = await summarizePDFText(truncatedText, language);

    console.log("PDF Upload: Summary generated successfully");
    res.json({ summary });
  } catch (error) {
    console.error("PDF Processing Error:", error);
    res.status(500).json({ message: `PDF Error: ${error.message || "Failed to process PDF"}` });
  }
};
