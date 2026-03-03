import { fetchNews } from "../services/newsService.js";
import { summarizeNews } from "../services/summarizerService.js";

const deduplicateArticles = (articles) => {
  const seenTitles = new Set();
  return (articles || []).filter(article => {
    if (!article.title) return false;
    const normalizedTitle = article.title.trim().toLowerCase();
    if (seenTitles.has(normalizedTitle)) {
      return false;
    }
    seenTitles.add(normalizedTitle);
    return true;
  });
};

export const getNewsSummary = async (req, res) => {
  try {
    const { category } = req.query;
    const data = await fetchNews(null, category || "top");
    const articles = deduplicateArticles(data.results);

    if (articles.length === 0) {
      return res.json({ totalArticles: 0, summary: "No news found currently." });
    }

    const summary = await summarizeNews(articles);

    res.json({
      totalArticles: articles.length,
      summary
    });
  } catch (error) {
    console.error("News summary error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details."
      });
    }
    res.status(500).json({ message: "Failed to generate news summary" });
  }
};

export const getNews = async (req, res) => {
  try {
    const { page, category } = req.query;
    const data = await fetchNews(page, category || "top");

    const uniqueArticles = deduplicateArticles(data.results);

    res.json({
      totalArticles: data.totalResults || 0,
      articles: uniqueArticles,
      nextPage: data.nextPage
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch news articles" });
  }
};

export const summarizeOne = async (req, res) => {
  const { article } = req.body;
  if (!article) return res.status(400).json({ message: "No article provided" });

  try {
    const summary = await summarizeNews([article]);
    res.json({ summary });
  } catch (error) {
    console.error("Single article summary error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details."
      });
    }
    res.status(500).json({ message: "Failed to summarize article" });
  }
};