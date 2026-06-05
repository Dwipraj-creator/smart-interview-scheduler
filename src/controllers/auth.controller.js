const { google } = require("googleapis");
const Interviewer = require("../models/interviewer.model");
const generateToken = require("../utils/generateToken");

const {
  oauth2Client,
  getGoogleAuthUrl,
  getGoogleTokens,
} = require("../services/googleAuth.service");

const googleLogin = (req, res) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
};

const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const tokens = await getGoogleTokens(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    let interviewer = await Interviewer.findOne({
      email: data.email,
    });

    if (!interviewer) {
      interviewer = await Interviewer.create({
        name: data.name,
        email: data.email,
        googleId: data.id,
        publicProfileId: data.email.split("@")[0],
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } else {
      interviewer.googleId = data.id;
      interviewer.name = data.name;
      interviewer.accessToken = tokens.access_token;

      if (tokens.refresh_token) {
        interviewer.refreshToken = tokens.refresh_token;
      }

      await interviewer.save();
    }

    const jwtToken = generateToken(interviewer._id);

    // res.redirect(
    //  `${process.env.FRONTEND_CALLBACK_URL}?token=${jwtToken}`
            
    // );

    res.json({
  success: true,
  message: "Google login successful",
  token: jwtToken,
  interviewer: {
    id: interviewer._id,
    name: interviewer.name,
    email: interviewer.email,
    publicProfileId: interviewer.publicProfileId,
  },
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  googleLogin,
  googleCallback,
};