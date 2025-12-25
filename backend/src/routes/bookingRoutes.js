const express = require('express');
const router = express.Router();
const {
  getUserBookings,
  getProviderBookings,
  createBooking,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

// All booking routes require authentication
router.use(protect);

// User routes - get their bookings
router.get('/', getUserBookings);

// Provider routes - get bookings assigned to them
router.get('/provider', getProviderBookings);

// Create new booking
router.post('/', createBooking);

// Update booking status (accept/reject for providers, or update by user)
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
