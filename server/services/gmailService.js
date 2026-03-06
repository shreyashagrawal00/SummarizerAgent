import { google } from "googleapis";

/**
 * Fetches Gmail emails for a user.
 * Returns { emails, newAccessToken? } — newAccessToken is set if the token was refreshed.
 */
export const fetchGmailEmails = async (accessToken, googleRefreshToken = null, maxResults = 10) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === "production" ? "https://summarizeragent.onrender.com/api/auth/google/callback" : "http://localhost:5001/api/auth/google/callback")
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: googleRefreshToken || undefined,
  });

  let newAccessToken = null;

  // Proactively refresh the access token when we have a refresh token,
  // so we don't fail mid-request when the token is expired.
  if (googleRefreshToken) {
    try {
      const { credentials } = await auth.refreshAccessToken();
      auth.setCredentials(credentials);
      newAccessToken = credentials.access_token || null;
      console.log("Gmail: access token refreshed successfully");
    } catch (refreshErr) {
      console.warn("Gmail: could not refresh token, trying existing:", refreshErr.message);
    }
  }

  const gmail = google.gmail({ version: "v1", auth });

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "in:inbox",
  });

  const messages = listResponse.data.messages || [];
  if (messages.length === 0) return { emails: [], newAccessToken };

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      const headers = detail.data.payload.headers;
      const getHeader = (name) =>
        headers.find((h) => h.name === name)?.value || "";

      return {
        id: msg.id,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        snippet: detail.data.snippet,
      };
    })
  );

  return { emails, newAccessToken };
};
