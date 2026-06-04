const Availability = require("../models/availability.model");
const Slot = require("../models/slot.model");
const {
  generateSlotsForAvailability,
} = require("../services/slot.service");

const createAvailability = async (req, res) => {
  try {
    const { daysOfWeek, startTime, endTime, duration } = req.body;

    const availability = await Availability.create({
      interviewerId: req.interviewerId,
      daysOfWeek,
      startTime,
      endTime,
      duration,
    });

    const createdSlots = await generateSlotsForAvailability(availability);

    res.status(201).json({
      success: true,
      message: "Availability created and slots generated",
      availability,
      createdSlots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      interviewerId: req.interviewerId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSlots = async (req, res) => {
  try {
    const slots = await Slot.find({
      interviewerId: req.interviewerId,
      startTime: { $gte: new Date() },
    }).sort({ startTime: 1 });

    res.json({
      success: true,
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

module.exports = {
  createAvailability,
  getAvailability,
  getSlots,
};