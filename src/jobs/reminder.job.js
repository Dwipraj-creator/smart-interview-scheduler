const cron = require("node-cron");

const Booking = require("../models/booking.model");
const Slot = require("../models/slot.model");
const Notification = require("../models/notification.model");

const startReminderJob = (io) => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const reminderStart = new Date(now.getTime() + 29 * 60 * 1000);
      const reminderEnd = new Date(now.getTime() + 31 * 60 * 1000);

      const bookings = await Booking.find({
        status: "booked",
        reminderSent: { $ne: true },
      }).populate("slotId");

      for (const booking of bookings) {
        const slot = booking.slotId;

        if (!slot) continue;

        if (
          slot.startTime >= reminderStart &&
          slot.startTime <= reminderEnd
        ) {
          const notification = await Notification.create({
            interviewerId: booking.interviewerId,
            bookingId: booking._id,
            type: "interview_reminder",
            message: `Interview with ${booking.candidateName} starts in 30 minutes.`,
          });

          io.to(booking.interviewerId.toString()).emit(
            "notification",
            notification
          );

          booking.reminderSent = true;
          await booking.save();
        }
      }
    } catch (error) {
      console.error("Reminder job error:", error.message);
    }
  });
};

module.exports = startReminderJob;