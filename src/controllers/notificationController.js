import { Notification } from '../models/notificationsModel.js';

// Create Notification
export const createNotification = async (req, res) => {
    
    console.log("CREATE HIT");
    

  try {
    const { title, message, audience, deliveryMethods, expiresAt } = req.body;

    console.log("REQ>BODY : ", req.body);
    
    if (!title || !message || !audience || !deliveryMethods) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
      
    const notification = new Notification({
      title,
      message,
      audience,
      deliveryMethods,
      createdBy: req.user,
      expiresAt,
    });

    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create notification', error: err.message });
  }
};

// Get All Notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: err.message });
  }
};

// Delete Notification
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete notification', error: err.message });
  }
};

// Toggle Notification Active/Inactive
export const toggleNotificationStatus = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isActive = !notification.isActive;
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notification status', error: err.message });
  }
};
