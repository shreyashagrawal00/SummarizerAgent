import axios from "axios";

export const fetchNews = async () => {
  const response = await axios.get(
    `https://newsapi.org/v2/top-headlines`,
    {
      params: {
        country: "in",
        pageSize: 15,
        apiKey: process.env.NEWS_API_KEY
      }
    }
  );

  return response.data.articles;
};