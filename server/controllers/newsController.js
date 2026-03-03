import { fetchNews } from "../services/newsService.js";
import { summarizeNews } from "../services/summarizerService.js";

export const getNewsSummary = async (req, res) => {
  try {
    const { category } = req.query;
    const data = await fetchNews(null, category || "top");
    const articles = data.results;

    if (!articles || articles.length === 0) {
      return res.json({ totalArticles: 0, summary: "No news found currently." });
    }

    const summary = await summarizeNews(articles);

    res.json({
      totalArticles: articles.length,
      summary
    });
  } catch (error) {
    console.error("News summary error:", error);
    // If it's a quota error, we should ideally tell the user
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
    res.json({
      totalArticles: data.totalResults || 0,
      articles: data.results || [],
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