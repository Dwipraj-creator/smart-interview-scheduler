const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer",
      required: true,
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },

    candidateName: {
      type: String,
      required: true,
      trim: true,
    },

    candidateEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    googleCalendarEventId: {
      type: String,
    },

    googleMeetLink: {
      type: String,
    },
    cancelToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },

    note: {
      type: String,
    },

    status: {
      type: String,
      enum: ["booked", "cancelled", "completed", "no-show"],
      default: "booked",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
