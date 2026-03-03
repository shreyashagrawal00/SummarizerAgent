import axios from "axios";

/**
 * Fetches news from newsdata.io API
 * Defaulting to global English news (language=en) and 'top' category for "Real News"
 */
export const fetchNews = async (page = null, category = "top", language = "en") => {
  try {
    const params = {
      apikey: process.env.NEWS_API_KEY,
      language,
      category
    };
    if (page) params.page = page;

    const response = await axios.get(
      `https://newsdata.io/api/1/latest`,
      {
        params,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("fetchNews Error:", error.response?.data || error.message);
    throw error;
  }
};