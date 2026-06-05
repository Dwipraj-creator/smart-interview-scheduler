const express = require("express");

const {
  googleLogin,
  googleCallback,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

module.exports = router;