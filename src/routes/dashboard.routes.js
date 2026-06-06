const express = require("express");

const {
  getDashboardStats,
  getUpcomingBookings,
  getPastBookings,
  updateBookingStatus,
  getBusiestDay,
  getAverageInterviewsPerWeek,
} = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth.midlleware");

const router = express.Router();

router.get("/stats", auth, getDashboardStats);

router.get(
  "/upcoming-bookings",
  auth,
  getUpcomingBookings
);

router.get(
  "/past-bookings",
  auth,
  getPastBookings
);

router.patch(
  "/bookings/:id/status",
  auth,
  updateBookingStatus
);

router.get(
  "/busiest-day",
  auth,
  getBusiestDay
);

router.get(
  "/average-per-week",
  auth,
  getAverageInterviewsPerWeek
);

module.exports = router;