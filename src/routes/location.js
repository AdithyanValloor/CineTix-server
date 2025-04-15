import express from 'express';
import { Theater } from '../models/theatersModel.js';
import { User } from '../models/userModel.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// 1. Get all available cities
router.get('/', async (req, res) => {
  try {
    const cities = await Theater.distinct('location', { isActive: true });
    res.json({ cities });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch locations." });
  }
});

// 2. Save selected city to user profile
router.put('/save-city', protect, async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ message: 'City is required.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { savedCity: city },
      { new: true }
    );

    res.status(200).json({
      message: 'City saved successfully.',
      savedCity: user.savedCity
    });
  } catch (err) {
    console.error('Error saving city:', err);
    res.status(500).json({ message: 'Failed to save city.' });
  }
});

// 3. Get user's saved city
router.get('/user-city', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedCity');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ city: user.savedCity || '' });
  } catch (err) {
    console.error('Error fetching saved city:', err);
    res.status(500).json({ message: 'Failed to fetch saved city.' });
  }
});

export { router as locationRouter };
