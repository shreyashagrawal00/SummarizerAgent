import { fetchNews } from "../services/newsService.js";
import { summarizeNews } from "../services/summarizerService.js";

export const getNewsSummary = async (req, res) => {
  const articles = await fetchNews();
  const summary = await summarizeNews(articles);

  res.json({
    totalArticles: articles.length,
    summary
  });
};