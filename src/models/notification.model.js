const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    type: {
      type: String,
      enum: ["new_booking", "booking_cancelled", "interview_reminder"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);