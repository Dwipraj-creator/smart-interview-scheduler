const Interviewer = require("../models/interviewer.model");
const Slot = require("../models/slot.model");
const Booking = require("../models/booking.model");
const { createInterviewEvent } = require("../services/googleCalendar.service");
const {
  sendCandidateBookingEmail,
  sendInterviewerBookingEmail,
  sendCandidateCancellationEmail,
  sendInterviewerCancellationEmail,
} = require("../services/gmail.service");
const crypto = require("crypto")
const { deleteInterviewEvent } = require("../services/googleCalendar.service");
const { createNotification } = require("../services/notification.service");

const getPublicSlots = async (req, res) => {
  try {
    const { publicProfileId } = req.params;
    const { startDate, endDate } = req.query;

    const interviewer = await Interviewer.findOne({ publicProfileId });

    if (!interviewer) {
      return res.status(404).json({
        success: false,
        message: "Interviewer not found",
      });
    }

    const filter = {
      interviewerId: interviewer._id,
      status: "available",
      startTime: { $gte: new Date() },
    };

    if (startDate || endDate) {
      filter.startTime = {};

      if (startDate) {
        filter.startTime.$gte = new Date(startDate);
      } else {
        filter.startTime.$gte = new Date();
      }

      if (endDate) {
        filter.startTime.$lte = new Date(endDate);
      }
    }

    const slots = await Slot.find(filter)
      .select("startTime endTime status")
      .sort({ startTime: 1 });

    res.json({
      success: true,
      interviewer: {
        name: interviewer.name,
        publicProfileId: interviewer.publicProfileId,
      },
      count: slots.length,
      slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const bookSlot = async (req, res) => {
  let bookedSlot = null;

  try {
    const { slotId, candidateName, candidateEmail, note } = req.body;

    if (!slotId || !candidateName || !candidateEmail) {
      return res.status(400).json({
        success: false,
        message: "slotId, candidateName and candidateEmail are required",
      });
    }

    const slot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        status: "available",
        startTime: { $gte: new Date() },
      },
      {
        status: "booked",
      },
      {
        new: true,
      },
    );

    if (!slot) {
      return res.status(409).json({
        success: false,
        message: "Slot is no longer available",
      });
    }

    bookedSlot = slot;

    const interviewer = await Interviewer.findById(slot.interviewerId);

    if (!interviewer || !interviewer.refreshToken) {
      throw new Error("Interviewer Google account is not connected");
    }

    const calendarEvent = await createInterviewEvent({
      interviewer,
      slot,
      candidateName,
      candidateEmail,
      note,
    });

    const cancelToken = crypto.randomBytes(32).toString("hex");

    const booking = await Booking.create({
      interviewerId: slot.interviewerId,
      slotId: slot._id,
      candidateName,
      candidateEmail,
      note,
      status: "booked",
      googleCalendarEventId: calendarEvent.id,
      googleMeetLink: calendarEvent.hangoutLink,
      cancelToken,
    });

    await sendCandidateBookingEmail({
  interviewer,
  candidateEmail,
  candidateName,
  slot,
  meetLink: calendarEvent.hangoutLink,
  cancelToken,
});

await sendInterviewerBookingEmail({
  interviewer,
  candidateName,
  candidateEmail,
  slot,
  meetLink: calendarEvent.hangoutLink,
});

await createNotification({
  req,
  interviewerId: slot.interviewerId,
  bookingId: booking._id,
  type: "new_booking",
  message: `${candidateName} booked an interview slot.`,
});

    res.status(201).json({
      success: true,
      message: "Slot booked successfully",
      booking,
      slot,
    });
  } catch (error) {
    if (bookedSlot) {
      await Slot.findByIdAndUpdate(bookedSlot._id, {
        status: "available",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { token } = req.params;

    const booking = await Booking.findOne({
      cancelToken: token,
      status: "booked",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired cancellation link",
      });
    }

    const slot = await Slot.findById(booking.slotId);
    const interviewer = await Interviewer.findById(booking.interviewerId);

    if (booking.googleCalendarEventId) {
      await deleteInterviewEvent({
        interviewer,
        eventId: booking.googleCalendarEventId,
      });
    }

    booking.status = "cancelled";
    booking.cancelToken = undefined;
    await booking.save();

    slot.status = "available";
    await slot.save();

    await sendCandidateCancellationEmail({
      interviewer,
      candidateEmail: booking.candidateEmail,
      candidateName: booking.candidateName,
      slot,
    });

    await sendInterviewerCancellationEmail({
      interviewer,
      candidateName: booking.candidateName,
      candidateEmail: booking.candidateEmail,
      slot,
    });

    await createNotification({
  req,
  interviewerId: booking.interviewerId,
  bookingId: booking._id,
  type: "booking_cancelled",
  message: `${booking.candidateName} cancelled their interview.`,
});

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPublicSlots,
  bookSlot,
cancelBooking,  
};
