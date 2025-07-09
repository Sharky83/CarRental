import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// Get all bookings for a car (public, for date picker)
router.get('/car/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    const bookings = await Booking.find({ car: carId, status: { $ne: 'cancelled' } }, 'pickupDate returnDate');
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
