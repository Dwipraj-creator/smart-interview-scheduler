const Interviewer = require("../models/interviewer.model");
const generateToken = require("../utils/generateToken");


const createInterviewer = async (req, res) => {
  try {
    const interviewer = await Interviewer.create(req.body);

    res.status(201).json({
      success: true,
      interviewer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const loginInterviewer = async (req, res) => {
  try {
    const { email } = req.body;

    const interviewer =
      await Interviewer.findOne({ email });

    if (!interviewer) {
      return res.status(404).json({
        success: false,
        message: "Interviewer not found",
      });
    }

    const token = generateToken(
      interviewer._id
    );

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (
  req,
  res
) => {
  try {
    const interviewer =
      await Interviewer.findById(
        req.interviewerId
      );

    res.json(interviewer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createInterviewer,
  loginInterviewer,
  getProfile,
};