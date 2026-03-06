import { Innertube, UniversalCache } from "youtubei.js";
import { summarizeVideoText } from "../services/summarizerService.js";
import axios from "axios";

// ─── Video ID extractor ───────────────────────────────────────────────────────
const extractVideoId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("?")[0];
      if (id && id.length === 11) return id;
    }
  } catch (_) {}
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

// ─── Helper: parse timedtext JSON events into plain text ─────────────────────
const eventsToText = (events) => {
  if (!events?.length) return null;
  const text = events
    .filter((e) => e.segs)
    .map((e) => e.segs.map((s) => s.utf8 || "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
};

// ─── Innertube singleton ──────────────────────────────────────────────────────
let innertubeInstance = null;
const getInnertube = async () => {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });
  }
  return innertubeInstance;
};

// ─── Method 1: Innertube — extract caption track URLs from player response ────
// getTranscript() returns 400 for auto-captions. Instead we read the caption
// tracks directly from the video info (player_response) and download them.
const extractWithInnertube = async (videoId) => {
  try {
    console.log("YouTube [1/3]: trying Innertube player captions...");
    const yt = await getInnertube();
    const info = await yt.getInfo(videoId);

    // The captions object lives at info.captions
    const captionTracks = info?.captions?.caption_tracks;

    if (!captionTracks?.length) {
      console.warn("YouTube [1/3]: no caption_tracks in player response");
      // Try getTranscript anyway as fallback within this method
      try {
        const transcriptData = await info.getTranscript();
        const segments =
          transcriptData?.transcript?.content?.body?.initial_segments ||
          transcriptData?.transcript?.content?.body?.content ||
          [];
        if (segments.length > 0) {
          const text = segments
            .map((seg) =>
              seg?.snippet?.text ||
              seg?.transcriptSegmentRenderer?.snippet?.runs?.[0]?.text ||
              seg?.text || ""
            )
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          if (text) {
            console.log(`YouTube [1/3]: getTranscript success — ${text.length} chars`);
            return text;
          }
        }
      } catch (transcriptErr) {
        console.warn("YouTube [1/3]: getTranscript also failed:", transcriptErr.message);
      }
      return null;
    }

    console.log(`YouTube [1/3]: found ${captionTracks.length} caption tracks`);

    // Prefer: manual English > auto English > any English > first available
    const track =
      captionTracks.find((t) => t.language_code === "en" && t.kind !== "asr") ||
      captionTracks.find((t) => t.language_code === "en") ||
      captionTracks.find((t) => t.language_code?.startsWith("en")) ||
      captionTracks[0];

    console.log(`YouTube [1/3]: using track lang=${track.language_code} kind=${track.kind || "manual"}`);

    // base_url comes from Innertube's internal session — authenticated, not IP-blocked
    const baseUrl = track.base_url;
    if (!baseUrl) return null;

    const res = await axios.get(baseUrl + "&fmt=json3", { timeout: 12000 });
    const text = eventsToText(res.data?.events);

    if (text) {
      console.log(`YouTube [1/3]: caption download success — ${text.length} chars`);
      return text;
    }

    return null;
  } catch (err) {
    console.warn("YouTube [1/3] Innertube failed:", err.message);
    innertubeInstance = null; // reset on failure
    return null;
  }
};

// ─── Method 2: YouTube Data API v3 + timedtext ────────────────────────────────
const extractWithYouTubeAPI = async (videoId) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    console.warn("YouTube [2/3]: YOUTUBE_API_KEY not set, skipping.");
    return null;
  }
  try {
    console.log("YouTube [2/3]: trying YouTube Data API v3...");

    const videoRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: { part: "contentDetails,snippet", id: videoId, key: YOUTUBE_API_KEY },
      timeout: 10000,
    });
    const item = videoRes.data?.items?.[0];
    if (!item) return null;
    console.log(`YouTube [2/3]: caption=${item.contentDetails?.caption}, lang=${item.snippet?.defaultAudioLanguage}`);

    // Try timedtext with known langs + key
    const langs = ["en", "en-US", "en-GB", "a.en", item.snippet?.defaultAudioLanguage].filter(Boolean);
    for (const lang of [...new Set(langs)]) {
      try {
        const res = await axios.get(
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3&key=${YOUTUBE_API_KEY}`,
          { timeout: 10000 }
        );
        const text = eventsToText(res.data?.events);
        if (text) {
          console.log(`YouTube [2/3]: timedtext success lang=${lang} — ${text.length} chars`);
          return text;
        }
      } catch (_) {}
    }

    // Discover langs via list
    try {
      const listRes = await axios.get(
        `https://www.youtube.com/api/timedtext?v=${videoId}&type=list&key=${YOUTUBE_API_KEY}`,
        { timeout: 8000 }
      );
      if (typeof listRes.data === "string" && listRes.data.includes("lang_code")) {
        const langMatches = [...listRes.data.matchAll(/lang_code="([^"]+)"/g)];
        console.log(`YouTube [2/3]: discovered langs: ${langMatches.map(m => m[1]).join(", ")}`);
        for (const [, langCode] of langMatches) {
          try {
            const res = await axios.get(
              `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${langCode}&fmt=json3&key=${YOUTUBE_API_KEY}`,
              { timeout: 8000 }
            );
            const text = eventsToText(res.data?.events);
            if (text) {
              console.log(`YouTube [2/3]: list lang=${langCode} success — ${text.length} chars`);
              return text;
            }
          } catch (_) {}
        }
      }
    } catch (_) {}

    return null;
  } catch (err) {
    console.warn("YouTube [2/3] failed:", err.response?.data?.error?.message || err.message);
    return null;
  }
};

// ─── Method 3: HTML scraping ─────────────────────────────────────────────────
const extractCaptionTracksJson = (html) => {
  const marker = '"captionTracks":';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  let i = start + marker.length;
  while (i < html.length && html[i] !== "[") i++;
  if (i >= html.length) return null;
  let depth = 0;
  const jsonStart = i;
  for (; i < html.length; i++) {
    if (html[i] === "[" || html[i] === "{") depth++;
    else if (html[i] === "]" || html[i] === "}") {
      depth--;
      if (depth === 0) return html.slice(jsonStart, i + 1);
    }
  }
  return null;
};

const extractWithHtmlScraping = async (videoId) => {
  try {
    console.log("YouTube [3/3]: trying HTML scraping...");
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };
    const { data: html } = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}&hl=en`,
      { headers, timeout: 15000 }
    );
    const jsonStr = extractCaptionTracksJson(html);
    if (!jsonStr) { console.warn("YouTube [3/3]: no captionTracks in HTML"); return null; }
    const captionTracks = JSON.parse(jsonStr);
    if (!captionTracks?.length) return null;
    const track =
      captionTracks.find((t) => t.languageCode === "en" && !t.kind) ||
      captionTracks.find((t) => t.languageCode === "en") ||
      captionTracks.find((t) => t.languageCode?.startsWith("en")) ||
      captionTracks[0];
    if (!track?.baseUrl) return null;
    const { data: json } = await axios.get(track.baseUrl + "&fmt=json3", { headers, timeout: 10000 });
    const text = eventsToText(json?.events);
    if (text) console.log(`YouTube [3/3]: HTML success — ${text.length} chars`);
    return text;
  } catch (err) {
    console.warn("YouTube [3/3] failed:", err.message);
    return null;
  }
};

// ─── Main handler ─────────────────────────────────────────────────────────────
export const summarizeYoutube = async (req, res) => {
  const { url, language } = req.body;
  if (!url) return res.status(400).json({ message: "YouTube URL is required" });

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({
      message: "Invalid YouTube URL. Please paste a standard youtube.com/watch?v= or youtu.be/ link.",
    });
  }

  console.log(`\n===== YouTube: processing video ID: ${videoId} =====`);

  try {
    const fullText =
      (await extractWithInnertube(videoId)) ||
      (await extractWithYouTubeAPI(videoId)) ||
      (await extractWithHtmlScraping(videoId));

    if (!fullText) {
      return res.status(404).json({
        message:
          "Could not fetch transcript for this video. The video may not have captions, or they may be disabled.",
      });
    }

    const truncated =
      fullText.length > 15000
        ? fullText.substring(0, 15000) + "...[Transcript Truncated]"
        : fullText;

    console.log(`YouTube: sending ${truncated.length} chars to AI...`);
    const summary = await summarizeVideoText(truncated, language || "en");
    res.json({ summary });
  } catch (error) {
    console.error("YouTube Summarize Error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded. Please check your AI service billing details.",
      });
    }
    res.status(500).json({ message: "Failed to summarize YouTube video. Please try again." });
  }
};