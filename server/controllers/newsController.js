import { fetchNews } from "../services/newsService.js";
import { summarizeNews } from "../services/summarizerService.js";

const deduplicateArticles = (articles) => {
  const seenTitles = new Set();
  return (articles || []).filter((article) => {
    if (!article.title) return false;
    const normalizedTitle = article.title.trim().toLowerCase();
    if (seenTitles.has(normalizedTitle)) return false;
    seenTitles.add(normalizedTitle);
    return true;
  });
};

// ─── Simple in-memory cache to avoid burning free-tier API quota ──────────────
let publicNewsCache = null;
let publicNewsCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const getNewsSummary = async (req, res) => {
  try {
    const { category } = req.query;
    const data = await fetchNews(null, category || "top");
    const articles = deduplicateArticles(data.results);

    if (articles.length === 0) {
      return res.json({ totalArticles: 0, summary: "No news found currently." });
    }

    const summary = await summarizeNews(articles);
    res.json({ totalArticles: articles.length, summary });
  } catch (error) {
    console.error("News summary error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details.",
      });
    }
    res.status(500).json({ message: "Failed to generate news summary" });
  }
};

export const getNews = async (req, res) => {
  try {
    const { page, category } = req.query;
    const isPublicRoute = !req.headers.authorization;

    // Use cache only for the public landing page route (no auth header)
    if (isPublicRoute && !page && !category) {
      const now = Date.now();
      if (publicNewsCache && now - publicNewsCacheTime < CACHE_TTL_MS) {
        console.log("News: serving from cache");
        return res.json(publicNewsCache);
      }
    }

    const data = await fetchNews(page, category || "top");
    const uniqueArticles = deduplicateArticles(data.results);

    const response = {
      totalArticles: data.totalResults || 0,
      articles: uniqueArticles,
      nextPage: data.nextPage,
    };

    // Store in cache for public route
    if (isPublicRoute && !page && !category) {
      publicNewsCache = response;
      publicNewsCacheTime = Date.now();
      console.log("News: cache updated");
    }

    res.json(response);
  } catch (error) {
    console.error("News fetch error:", error.response?.data || error.message);

    // If cache is stale but exists, return it rather than failing
    if (publicNewsCache) {
      console.warn("News: API failed, returning stale cache");
      return res.json(publicNewsCache);
    }

    res.status(500).json({ message: "Failed to fetch news articles" });
  }
};

export const summarizeOne = async (req, res) => {
  const { article, language } = req.body;
  if (!article) return res.status(400).json({ message: "No article provided" });

  try {
    const summary = await summarizeNews([article], language || "en");
    res.json({ summary });
  } catch (error) {
    console.error("Single article summary error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details.",
      });
    }
    res.status(500).json({ message: "Failed to summarize article" });
  }
};