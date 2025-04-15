import mongoose, { Schema, model } from 'mongoose';

const userNotificationStatusSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export const UserNotificationStatus = model('UserNotificationStatus', userNotificationStatusSchema);
