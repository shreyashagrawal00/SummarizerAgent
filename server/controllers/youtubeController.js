import { Innertube, UniversalCache } from "youtubei.js";
import { summarizeVideoText } from "../services/summarizerService.js";
import axios from "axios";

// Initialize Innertube globally so we don't recreate it on every request
let yt;
const initYoutube = async () => {
  if (!yt) {
    yt = await Innertube.create({
      generate_session_locally: true,
      cache: new UniversalCache(false),
    });
  }
  return yt;
};

// Helper function to extract video ID
const extractVideoId = (url) => {
  const regExp =
    /^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

/**
 * FIX: The old regex  /"captionTracks":(\[.*?\])/  used a non-greedy match
 * that stopped at the first "]", producing truncated / invalid JSON.
 * We now walk the string character-by-character to find the matching "]".
 */
const extractCaptionTracksJson = (html) => {
  const marker = '"captionTracks":';
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let i = start + marker.length;
  // Skip whitespace
  while (i < html.length && html[i] !== "[") i++;
  if (i >= html.length) return null;

  let depth = 0;
  let jsonStart = i;
  for (; i < html.length; i++) {
    if (html[i] === "[" || html[i] === "{") depth++;
    else if (html[i] === "]" || html[i] === "}") {
      depth--;
      if (depth === 0) {
        return html.slice(jsonStart, i + 1);
      }
    }
  }
  return null;
};

// Primary extractor: scrapes raw YouTube HTML for captions
const fallbackExtractTranscript = async (videoId) => {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };

    const { data: html } = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers, timeout: 15000 }
    );

    const jsonStr = extractCaptionTracksJson(html);
    if (!jsonStr) {
      console.log("No captionTracks found in HTML");
      return null;
    }

    let captionTracks;
    try {
      captionTracks = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse captionTracks JSON:", e.message);
      return null;
    }

    if (!captionTracks || captionTracks.length === 0) return null;

    // Prefer English, then English-like, then first available
    const track =
      captionTracks.find((t) => t.languageCode === "en") ||
      captionTracks.find((t) => t.languageCode?.startsWith("en")) ||
      captionTracks[0];

    if (!track?.baseUrl) return null;

    // Request JSON format
    const trackUrl = track.baseUrl + "&fmt=json3";
    const { data: json } = await axios.get(trackUrl, {
      headers,
      timeout: 10000,
    });

    if (!json?.events) return null;

    const text = json.events
      .filter((e) => e.segs)
      .map((e) => e.segs.map((s) => s.utf8).join(""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text || null;
  } catch (err) {
    console.error("Fallback transcript extraction failed:", err.message);
    return null;
  }
};

// Secondary extractor: uses youtubei.js (v16+ compatible path)
const youtubeJsExtractTranscript = async (videoId) => {
  try {
    const tube = await initYoutube();
    const info = await tube.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    // youtubei.js v16+ path
    const segments =
      transcriptData?.transcript?.content?.body?.initial_segments ||   // older
      transcriptData?.transcript?.content?.body?.content ||            // some builds
      [];

    if (segments.length === 0) {
      console.log("youtubei.js: no transcript segments found");
      return null;
    }

    const text = segments
      .map((seg) => seg?.snippet?.text || seg?.text || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text || null;
  } catch (err) {
    console.error("youtubei.js transcript failed:", err.message);
    return null;
  }
};

export const summarizeYoutube = async (req, res) => {
  const { url, language } = req.body;

  if (!url) {
    return res.status(400).json({ message: "YouTube URL is required" });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ message: "Invalid YouTube URL format." });
  }

  try {
    let fullText = null;

    // Attempt 1: Fast raw HTML extraction
    console.log(`YouTube: trying HTML extraction for video ${videoId}`);
    fullText = await fallbackExtractTranscript(videoId);

    // Attempt 2: youtubei.js
    if (!fullText) {
      console.log("YouTube: HTML extraction failed, trying youtubei.js...");
      fullText = await youtubeJsExtractTranscript(videoId);
    }

    if (!fullText || fullText.trim() === "") {
      return res.status(404).json({
        message:
          "No transcript found for this video. Please ensure the video has captions enabled.",
      });
    }

    console.log(`YouTube: extracted ${fullText.length} characters, summarizing...`);

    // Limit transcript size to avoid token issues
    const truncated =
      fullText.length > 15000
        ? fullText.substring(0, 15000) + "...[Transcript Truncated]"
        : fullText;

    const summary = await summarizeVideoText(truncated, language || "en");
    res.json({ summary });
  } catch (error) {
    console.error("YouTube Summarize Error:", error);

    if (
      error.message?.includes("Could not find captions") ||
      error.message?.includes("Transcript not available")
    ) {
      return res.status(400).json({
        message:
          "Could not find captions for this video. Captions might be disabled.",
      });
    }
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details.",
      });
    }
    res
      .status(500)
      .json({ message: "Failed to summarize YouTube video. Please try again." });
  }
};