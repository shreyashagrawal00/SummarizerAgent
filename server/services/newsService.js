import axios from "axios";

export const fetchNews = async () => {
  try {
    const response = await axios.get(
      `https://newsdata.io/api/1/latest`,
      {
        params: {
          country: "in",
          apikey: process.env.NEWS_API_KEY
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      }
    );
    return response.data.results;
  } catch (error) {
    console.error("fetchNews Error:", error.response?.data || error.message);
    throw error;
  }
};