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

// ─── Retry helper: wait N ms ──────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Axios fetch with 429 retry ───────────────────────────────────────────────
// On 429, waits 3s and retries once before giving up
const fetchWithRetry = async (url, options = {}, retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, options);
      return res;
    } catch (err) {
      const status = err.response?.status;
      if (status === 429 && i < retries - 1) {
        const wait = 3000 * (i + 1); // 3s, 6s
        console.warn(`429 rate limited — waiting ${wait}ms before retry ${i + 1}...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
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

// ─── Method 1: Innertube — reads caption_tracks from player response ──────────
// The base_url from caption_tracks points to googlevideo.com CDN (not youtube.com)
// so it bypasses the IP-based rate limiting that hits methods 2 and 3.
const extractWithInnertube = async (videoId) => {
  try {
    console.log("YouTube [1/3]: trying Innertube player captions...");
    const yt = await getInnertube();
    const info = await yt.getInfo(videoId);

    const captionTracks = info?.captions?.caption_tracks;

    if (captionTracks?.length) {
      console.log(`YouTube [1/3]: found ${captionTracks.length} caption tracks`);

      // Prefer manual English > auto English > any English > first available
      const track =
        captionTracks.find((t) => t.language_code === "en" && t.kind !== "asr") ||
        captionTracks.find((t) => t.language_code === "en") ||
        captionTracks.find((t) => t.language_code?.startsWith("en")) ||
        captionTracks[0];

      console.log(`YouTube [1/3]: using lang=${track.language_code} kind=${track.kind || "manual"} url=${track.base_url?.substring(0, 60)}...`);

      if (track?.base_url) {
        // This URL goes to googlevideo.com CDN — not rate limited like youtube.com
        const res = await fetchWithRetry(track.base_url + "&fmt=json3", { timeout: 12000 });
        const text = eventsToText(res.data?.events);
        if (text) {
          console.log(`YouTube [1/3]: caption download success — ${text.length} chars`);
          return text;
        }
      }
    }

    // Fallback within method: try getTranscript() for manually-captioned videos
    console.log("YouTube [1/3]: trying getTranscript()...");
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
    } catch (e) {
      console.warn("YouTube [1/3]: getTranscript failed:", e.message);
    }

    console.warn("YouTube [1/3]: no transcript found via Innertube");
    return null;
  } catch (err) {
    console.warn("YouTube [1/3] Innertube failed:", err.message);
    innertubeInstance = null; // reset bad session
    return null;
  }
};

// ─── Method 2: timedtext with API key ────────────────────────────────────────
const extractWithYouTubeAPI = async (videoId) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) return null;

  try {
    console.log("YouTube [2/3]: trying timedtext with API key...");
    const langs = ["en", "en-US", "en-GB", "a.en"];
    for (const lang of langs) {
      try {
        const res = await fetchWithRetry(
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
    return null;
  } catch (err) {
    console.warn("YouTube [2/3] failed:", err.message);
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
    const { data: html } = await fetchWithRetry(
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
    const { data: json } = await fetchWithRetry(track.baseUrl + "&fmt=json3", { headers, timeout: 10000 });
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
          "Could not fetch transcript. YouTube is rate limiting this server. Please try again in a few seconds.",
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