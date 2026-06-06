const Notification = require("../models/notification.model");

const createNotification = async ({
  req,
  interviewerId,
  bookingId,
  type,
  message,
}) => {
  const notification = await Notification.create({
    interviewerId,
    bookingId,
    type,
    message,
  });

  const io = req.app.get("io");

  if (io) {
    io.to(interviewerId.toString()).emit("notification", notification);
  }

  return notification;
};

module.exports = {
  createNotification,
};