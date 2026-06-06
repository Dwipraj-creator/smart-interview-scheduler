const express = require("express");


const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notification.controller");
const auth = require("../middleware/auth.midlleware");

const router = express.Router();

router.get("/", auth, getNotifications);
router.patch("/:id/read", auth, markNotificationAsRead);
router.patch("/read-all", auth, markAllNotificationsAsRead);

module.exports = router;