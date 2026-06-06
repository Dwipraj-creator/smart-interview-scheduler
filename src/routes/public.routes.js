const express = require("express");

const {
  getPublicSlots,
  bookSlot,
  cancelBooking
} = require("../controllers/public.controller");

const router = express.Router();

router.get("/interviewers/:publicProfileId/slots", getPublicSlots);

router.post("/bookings", bookSlot);

router.get("/bookings/cancel/:token", cancelBooking);

module.exports = router;