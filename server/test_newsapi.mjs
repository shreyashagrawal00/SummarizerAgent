import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const fetchNews = async () => {
  try {
    const params = {
      country: "in",
      apikey: process.env.NEWS_API_KEY
    };

    console.log("Fetching news with API Key:", process.env.NEWS_API_KEY);
    const response = await axios.get(
      `https://newsdata.io/api/1/latest`,
      { params }
    );
    console.log("Status:", response.status);
    console.log("Total Results:", response.data.totalResults);
    console.log("First Article Title:", response.data.results?.[0]?.title);
    console.log("Sample Data:", JSON.stringify(response.data.results?.[0], null, 2));
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};

fetchNews();
