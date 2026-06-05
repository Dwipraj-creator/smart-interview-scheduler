const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);

const getGoogleAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar",
    ],
  });
};

const getGoogleTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

module.exports = {
  oauth2Client,
  getGoogleAuthUrl,
  getGoogleTokens,
};