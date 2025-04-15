import { UserNotificationStatus } from "../models/userNotificationModel.js";
import { Notification } from "../models/notificationsModel.js";


export const getUserNotifications = async (req, res) => {
    
    console.log("HIT ");
    

    try {
      const allNotifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 });
  
      const userStatuses = await UserNotificationStatus.find({ user: req.user._id });
      const statusMap = new Map();
      userStatuses.forEach(status => {
        statusMap.set(status.notification.toString(), status);
      });
  
      const finalList = allNotifications
        .filter(n => !statusMap.get(n._id.toString())?.isDeleted)
        .map(n => ({
          ...n._doc,
          isRead: statusMap.get(n._id.toString())?.isRead || false,
        }));
  
      res.status(200).json({ success: true, notifications: finalList });
    } catch (err) {
        console.log(err);
        
      res.status(500).json({ success: false, message: 'Failed to get user notifications', error: err.message });
    }
};


export const markNotificationAsRead = async (req, res) => {
    try {
      const { id } = req.body; // FIXED here
  
      const existingStatus = await UserNotificationStatus.findOne({
        user: req.user._id,
        notification: id,
      });
  
      if (existingStatus) {
        existingStatus.isRead = true;
        await existingStatus.save();
      } else {
        await UserNotificationStatus.create({
          user: req.user._id,
          notification: id,
          isRead: true,
        });
      }
  
      res.status(200).json({ success: true, message: "Marked as read" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to mark as read",
        error: err.message,
      });
    }
};
  
  
  

export const deleteUserNotification = async (req, res) => {
    try {
      const { id } = req.body; // FIXED here
  
      const existingStatus = await UserNotificationStatus.findOne({
        user: req.user._id,
        notification: id,
      });
  
      if (existingStatus) {
        existingStatus.isDeleted = true;
        await existingStatus.save();
      } else {
        await UserNotificationStatus.create({
          user: req.user._id,
          notification: id,
          isDeleted: true,
        });
      }
  
      res
        .status(200)
        .json({ success: true, message: "Notification deleted for user" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: err.message,
      });
    }
};
  
  