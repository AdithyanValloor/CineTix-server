import mongoose, { Schema, model } from "mongoose";

const notificationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  audience: {
    type: String,
    enum: ['all', 'users', 'exhibitors', 'admins'],
    default: 'all',
  },
  deliveryMethods: {
    type: [String],
    enum: ['in-app', 'email'],
    default: ['in-app'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export const Notification = model('Notification', notificationSchema);
