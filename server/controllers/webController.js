import axios from "axios";
import * as cheerio from "cheerio";
import { summarizeWebText } from "../services/summarizerService.js";

export const summarizeWebpage = async (req, res) => {
  const { url, language } = req.body;

  if (!url) {
    return res.status(400).json({ message: "Webpage URL is required" });
  }

  try {
    // Fetch the raw HTML of the webpage
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    // Use Cheerio to parse the HTML
    const $ = cheerio.load(response.data);

    // Remove scripts, styles, noscript, iframes, etc to clean up the content
    $("script, style, noscript, iframe, nav, footer, header, aside").remove();

    // Extract text from the remaining body
    let textContent = $("body").text();

    // Clean up whitespace: replace multiple spaces/newlines with a single space
    textContent = textContent.replace(/\s+/g, ' ').trim();

    if (!textContent || textContent.length < 50) {
      return res.status(400).json({ message: "Could not extract enough readable text from this webpage." });
    }

    const MAX_CHARS = 15000;
    if (textContent.length > MAX_CHARS) {
      textContent = textContent.substring(0, MAX_CHARS) + "...[Content Truncated]";
    }

    // Summarize the webpage content
    const summary = await summarizeWebText(textContent, language || "en");

    res.json({ summary });

  } catch (error) {
    console.error("Webpage Summarize Error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details."
      });
    }
    res.status(500).json({ message: "Failed to fetch or summarize the webpage." });
  }
};
