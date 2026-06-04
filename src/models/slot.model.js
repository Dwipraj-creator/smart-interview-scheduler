const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer",
      required: true,
    },

    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "available",
        "booked",
        "cancelled",
        "completed",
        "unavailable",
      ],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

slotSchema.index(
  { interviewerId: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

module.exports = mongoose.model("Slot", slotSchema);