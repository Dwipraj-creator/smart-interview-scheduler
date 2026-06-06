const Slot = require("../models/slot.model");
const Booking = require("../models/booking.model");

const getDashboardStats = async (req, res) => {
  try {
    const interviewerId = req.interviewerId;

    const totalSlots = await Slot.countDocuments({
      interviewerId,
    });

    const bookedSlots = await Slot.countDocuments({
      interviewerId,
      status: "booked",
    });

    const cancelledBookings = await Booking.countDocuments({
      interviewerId,
      status: "cancelled",
    });

    const completedBookings = await Booking.countDocuments({
      interviewerId,
      status: "completed",
    });

    res.json({
      success: true,
      stats: {
        totalSlots,
        bookedSlots,
        cancelledBookings,
        completedBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUpcomingBookings = async (req, res) => {
  try {
    const next7Days = new Date();

    next7Days.setDate(next7Days.getDate() + 7);

    const bookings = await Booking.find({
      interviewerId: req.interviewerId,
      status: "booked",
    })
      .populate("slotId")
      .sort({ createdAt: 1 });

    const upcoming = bookings.filter((booking) => {
      if (!booking.slotId) return false;

      return (
        booking.slotId.startTime >= new Date() &&
        booking.slotId.startTime <= next7Days
      );
    });

    res.json({
      success: true,
      count: upcoming.length,
      bookings: upcoming,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPastBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      interviewerId: req.interviewerId,
    })
      .populate("slotId")
      .sort({ createdAt: -1 });

    const past = bookings.filter((booking) => {
      if (!booking.slotId) return false;

      return booking.slotId.endTime < new Date();
    });

    res.json({
      success: true,
      count: past.length,
      bookings: past,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["completed", "no-show"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        interviewerId: req.interviewerId,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBusiestDay = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      {
        $match: {
          interviewerId: req.interviewerId,
        },
      },

      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },

      {
        $unwind: "$slot",
      },

      {
        $group: {
          _id: {
            $dayOfWeek: "$slot.startTime",
          },
          totalBookings: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalBookings: -1,
        },
      },

      {
        $limit: 1,
      },
    ]);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAverageInterviewsPerWeek = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();

    threeMonthsAgo.setMonth(
      threeMonthsAgo.getMonth() - 3
    );

    const result = await Booking.aggregate([
      {
        $match: {
          interviewerId: req.interviewerId,
          createdAt: {
            $gte: threeMonthsAgo,
          },
        },
      },

      {
        $group: {
          _id: {
            week: {
              $isoWeek: "$createdAt",
            },
          },
          interviews: {
            $sum: 1,
          },
        },
      },

      {
        $group: {
          _id: null,
          averageInterviewsPerWeek: {
            $avg: "$interviews",
          },
        },
      },
    ]);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getUpcomingBookings,
  getPastBookings,
  updateBookingStatus,
  getBusiestDay,
  getAverageInterviewsPerWeek,
};