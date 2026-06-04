const express = require("express");

const {
  getPublicSlots,
  bookSlot,
} = require("../controllers/public.controller");

const router = express.Router();

router.get("/interviewers/:publicProfileId/slots", getPublicSlots);

router.post("/bookings", bookSlot);

module.exports = router;