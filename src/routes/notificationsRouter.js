import express from 'express';
import { authorizeAdmin, protect } from '../middlewares/auth.js';
import { createNotification, deleteNotification, getAllNotifications, toggleNotificationStatus } from '../controllers/notificationController.js';

const router = express.Router();

// Protected admin routes
router.post('/create', protect, authorizeAdmin,createNotification);
router.get('/get', protect, getAllNotifications);
router.delete('/:id', protect, authorizeAdmin, deleteNotification);
router.patch('/:id/toggle', protect, authorizeAdmin, toggleNotificationStatus);

export  {router as notificationRouter};
