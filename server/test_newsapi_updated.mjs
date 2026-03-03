import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const fetchNewsTest = async (page = null, category = "top", language = "en") => {
  try {
    const params = {
      apikey: process.env.NEWS_API_KEY,
      language,
      category
    };
    if (page) params.page = page;

    console.log(`Fetching news (Lang: ${language}, Cat: ${category})...`);
    const response = await axios.get(
      `https://newsdata.io/api/1/latest`,
      { params }
    );
    console.log("Status:", response.status);
    console.log("Total Results:", response.data.totalResults);
    console.log("First Article Title:", response.data.results?.[0]?.title);
    console.log("Language of First Article:", response.data.results?.[0]?.language);
    console.log("Category of First Article:", response.data.results?.[0]?.category);
    // console.log("Sample Data:", JSON.stringify(response.data.results?.[0], null, 2));
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};

fetchNewsTest();
