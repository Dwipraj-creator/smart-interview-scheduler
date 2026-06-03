
const express = require("express");


const router = express.Router();

const {
  createInterviewer,loginInterviewer,getProfile
} = require("../controllers/interviewer.controller");
const auth = require("../middleware/auth.midlleware");

router.post("/create", createInterviewer);
router.post("/login", loginInterviewer);
router.get(
  "/profile",
  auth,
  getProfile
);

module.exports = router;