import { google } from "googleapis";

export const fetchGmailEmails = async (accessToken, googleRefreshToken = null, maxResults = 10) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  const credentials = { access_token: accessToken };
  if (googleRefreshToken) {
    credentials.refresh_token = googleRefreshToken;
  }
  auth.setCredentials(credentials);

  const gmail = google.gmail({ version: "v1", auth });

  // Get list of recent messages
  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "in:inbox",
  });

  const messages = listResponse.data.messages || [];
  if (messages.length === 0) return [];

  // Fetch details for each message
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

  return emails;
};
