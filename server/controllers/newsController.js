import { fetchNews } from "../services/newsService.js";
import { summarizeNews } from "../services/summarizerService.js";

export const getNewsSummary = async (req, res) => {
  try {
    const articles = await fetchNews();
    console.log(`Fetched ${articles?.length || 0} news articles.`);

    if (!articles || articles.length === 0) {
      return res.json({ totalArticles: 0, summary: "No news found currently." });
    }

    const summary = await summarizeNews(articles);
    console.log("Summary generated successfully.");

    res.json({
      totalArticles: articles.length,
      summary
    });
  } catch (error) {
    console.error("News summary error:", error);
    res.status(500).json({ message: "Failed to generate news summary" });
  }
};