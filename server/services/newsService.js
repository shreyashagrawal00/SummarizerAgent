import axios from "axios";

export const fetchNews = async () => {
  const response = await axios.get(
    `https://newsdata.io/api/1/latest? `,
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