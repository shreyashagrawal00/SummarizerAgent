import { google } from "googleapis";

/**
 * Fetches Gmail emails for a user.
 * Returns { emails, newAccessToken? }
 *
 * FIX: Only refreshes token when the first attempt fails with 401,
 * instead of always refreshing upfront (which throws if refresh token is missing/expired).
 */
export const fetchGmailEmails = async (accessToken, googleRefreshToken = null, maxResults = 10) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://summarizeragent.onrender.com/api/auth/google/callback"
        : "http://localhost:5001/api/auth/google/callback")
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: googleRefreshToken || undefined,
  });

  let newAccessToken = null;
  const gmail = google.gmail({ version: "v1", auth });

  // ── Helper: list + fetch emails ───────────────────────────────────────────
  const fetchEmails = async () => {
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      q: "in:inbox",
    });

    const messages = listResponse.data.messages || [];
    if (messages.length === 0) return [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });

        const headers = detail.data.payload?.headers || [];
        const getHeader = (name) =>
          headers.find((h) => h.name === name)?.value || "";

        return {
          id: msg.id,
          from: getHeader("From"),
          subject: getHeader("Subject"),
          date: getHeader("Date"),
          snippet: detail.data.snippet || "",
        };
      })
    );

    return emails;
  };

  // ── First attempt with current access token ───────────────────────────────
  try {
    const emails = await fetchEmails();
    return { emails, newAccessToken: null };
  } catch (firstErr) {
    const status = firstErr?.response?.status || firstErr?.code;
    const isAuthError = status === 401 || status === "401" || firstErr?.message?.includes("invalid_grant");

    // If it's not an auth error, or we have no refresh token, rethrow immediately
    if (!isAuthError || !googleRefreshToken) {
      console.error("Gmail fetch failed (non-auth error):", firstErr.message);
      throw firstErr;
    }

    // ── Token expired — try refreshing once ──────────────────────────────────
    console.log("Gmail: access token expired, attempting refresh...");
    try {
      const { credentials } = await auth.refreshAccessToken();
      auth.setCredentials(credentials);
      newAccessToken = credentials.access_token || null;
      console.log("Gmail: token refreshed successfully, retrying fetch...");
    } catch (refreshErr) {
      console.error("Gmail: token refresh failed:", refreshErr.message);
      // Throw a clean 401 so the controller returns the right error to frontend
      const err = new Error("Gmail token refresh failed");
      err.code = 401;
      throw err;
    }

    // ── Retry with refreshed token ───────────────────────────────────────────
    const emails = await fetchEmails();
    return { emails, newAccessToken };
  }
};