import User from "../models/User.js";
import { fetchGmailEmails } from "../services/gmailService.js";
import { summarizeNews } from "../services/summarizerService.js";

/**
 * Helper: fetch emails and persist any refreshed access token.
 */
const fetchAndPersistEmails = async (user) => {
  const { emails, newAccessToken } = await fetchGmailEmails(
    user.googleAccessToken,
    user.googleRefreshToken
  );

  // If the service refreshed the token, save it back to the DB
  if (newAccessToken && newAccessToken !== user.googleAccessToken) {
    user.googleAccessToken = newAccessToken;
    await user.save();
    console.log("Gmail: saved refreshed access token for", user.email);
  }

  return emails;
};

export const getEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.googleAccessToken) {
      return res.status(403).json({
        message: "Gmail not connected",
        detail: "Please sign in with Google to access your emails.",
      });
    }

    console.log("Gmail fetch - User:", user.email);
    console.log("Gmail fetch - Has access token:", !!user.googleAccessToken);
    console.log("Gmail fetch - Has refresh token:", !!user.googleRefreshToken);

    const emails = await fetchAndPersistEmails(user);
    res.json({ totalEmails: emails.length, emails });
  } catch (error) {
    console.error("Gmail fetch error:", error.message);
    console.error("Gmail fetch error details:", JSON.stringify(error.response?.data || error.errors || {}, null, 2));
    if (error.code === 401 || error.response?.status === 401) {
      return res.status(401).json({
        message: "Gmail token expired",
        detail: "Please sign in with Google again to refresh your token.",
      });
    }
    res.status(500).json({ message: "Failed to fetch emails" });
  }
};

export const summarizeEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.googleAccessToken) {
      return res.status(403).json({
        message: "Gmail not connected",
        detail: "Please sign in with Google to access your emails.",
      });
    }

    const emails = await fetchAndPersistEmails(user);
    if (!emails || emails.length === 0) {
      return res.json({ totalEmails: 0, summary: "No emails to summarize." });
    }

    const articles = emails.map((e) => ({
      title: e.subject || "(No Subject)",
      description: `From: ${e.from}\n${e.snippet}`,
    }));

    const summary = await summarizeNews(articles);
    res.json({ totalEmails: emails.length, summary });
  } catch (error) {
    console.error("Gmail summary error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details.",
      });
    }
    res.status(500).json({ message: "Failed to summarize emails" });
  }
};

export const summarizeOneEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "No email provided" });

  try {
    const articles = [
      {
        title: email.subject || "(No Subject)",
        description: `From: ${email.from}\n${email.snippet}`,
      },
    ];

    const summary = await summarizeNews(articles);
    res.json({ summary });
  } catch (error) {
    console.error("Single email summary error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details.",
      });
    }
    res.status(500).json({ message: "Failed to summarize email" });
  }
};
