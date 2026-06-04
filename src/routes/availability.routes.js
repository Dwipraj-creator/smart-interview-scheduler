const express = require("express");



const {
  createAvailability,
  getAvailability,
  getSlots,
} = require("../controllers/availability.controller");
const auth = require("../middleware/auth.midlleware");

const router = express.Router();

router.post("/", auth, createAvailability);

router.get("/", auth, getAvailability);

router.get("/slots", auth, getSlots);

module.exports = router;