const Notification = require("../models/notification.model");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      interviewerId: req.interviewerId,
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      interviewerId: req.interviewerId,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        interviewerId: req.interviewerId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        interviewerId: req.interviewerId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};