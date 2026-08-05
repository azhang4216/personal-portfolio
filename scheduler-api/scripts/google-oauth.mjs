import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const port = Number(process.env.OAUTH_HELPER_PORT || 8787);
const redirectUri = `http://localhost:${port}/oauth/callback`;
const state = randomBytes(24).toString("hex");

if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET before running this helper.");
  process.exit(1);
}

const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authorizationUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  access_type: "offline",
  prompt: "consent",
  state,
  scope: [
    "https://www.googleapis.com/auth/calendar.freebusy",
    "https://www.googleapis.com/auth/calendar.events.owned",
  ].join(" "),
}).toString();

const server = createServer(async (request, response) => {
  const url = new URL(request.url, redirectUri);
  if (url.pathname !== "/oauth/callback") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (url.searchParams.get("state") !== state || !url.searchParams.get("code")) {
    response.writeHead(400).end("Invalid OAuth callback.");
    return;
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: url.searchParams.get("code"),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok || !tokens.refresh_token) {
    response.writeHead(500).end("Google did not return a refresh token. Check the terminal for details.");
    console.error("OAuth exchange failed. Revoke the app grant and retry with prompt=consent.");
    server.close();
    return;
  }

  response.writeHead(200, { "Content-Type": "text/plain" }).end("Authorization complete. Return to the terminal.");
  console.log("\nCopy this value directly into Render as GOOGLE_OAUTH_REFRESH_TOKEN, then clear your terminal history if it is retained:\n");
  console.log(tokens.refresh_token);
  server.close();
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Add this authorized redirect URI to the Google OAuth client: ${redirectUri}\n`);
  console.log("Open this URL while signed in as angela@pier-finance.com:\n");
  console.log(authorizationUrl.toString());
});
