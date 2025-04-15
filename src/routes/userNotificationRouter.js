import express from "express";
import { protect } from "../middlewares/auth.js";
import { deleteUserNotification, getUserNotifications, markNotificationAsRead } from "../controllers/userNotificationController.js";

const router = express.Router()

// Get all notifications
router.get("/get", protect , getUserNotifications)

// Mark notification as read
router.post("/mark-read", protect, markNotificationAsRead)

// Delete notification 
router.delete("/delete", protect, deleteUserNotification)

export { router as userNotificationRouter}