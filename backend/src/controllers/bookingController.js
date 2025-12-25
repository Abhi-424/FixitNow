const Booking = require('../models/Booking');

// Get all bookings for logged-in user
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('provider', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Get all bookings assigned to provider OR available in pool
const getProviderBookings = async (req, res) => {
  try {
    // Find bookings where:
    // 1. Provider is assigned to this user (Assigned jobs)
    // 2. Provider is null AND status is 'Pending' (Open requests)
    const bookings = await Booking.find({
      $or: [
        { provider: req.user.id },
        { provider: null, status: 'Pending' }
      ]
    })
      .populate('user', 'username email location')
      .populate('serviceId', 'category basePrice')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { service, serviceId, description, location, scheduledDate, amount } = req.body;

    const booking = new Booking({
      user: req.user.id,
      service: service,      // Service Name
      serviceId: serviceId,  // Service ID (optional but recommended)
      description,
      location,
      scheduledDate,
      amount: amount || 0,
      status: 'Pending',
      provider: null // Explicitly null initially
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Provider Logic
    if (req.user.role === 'provider') {
      // 1. Accepting a pending booking
      if (status === 'Accepted') {
        if (booking.status !== 'Pending') {
          return res.status(400).json({ message: 'Booking is not pending' });
        }
        if (booking.provider && booking.provider.toString() !== req.user.id) {
          return res.status(400).json({ message: 'Booking already assigned to another provider' });
        }
        booking.provider = req.user.id;
        booking.status = 'Accepted';
      } 
      // 2. Starting the job
      else if (status === 'In Progress') {
        if (booking.status !== 'Accepted') {
           return res.status(400).json({ message: 'Booking must be accepted first' });
        }
        if (booking.provider.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized to start this booking' });
        }
        booking.status = 'In Progress';
      }
      // 3. Completing the job (Waiting for User Confirmation)
      else if (status === 'Waiting for Confirmation') {
        if (booking.status !== 'In Progress') {
           return res.status(400).json({ message: 'Booking must be in progress to complete' });
        }
        if (booking.provider.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized to complete this booking' });
        }
        booking.status = 'Waiting for Confirmation';
        booking.technicianCompleted = true;
      }
      else {
        return res.status(400).json({ message: 'Invalid status update for provider' });
      }
    } 
    
    // User Logic
    else if (req.user.role === 'user') {
      // 4. Confirming completion
      if (status === 'Completed') {
        if (booking.status !== 'Waiting for Confirmation') {
           return res.status(400).json({ message: 'technician must complete the job first' });
        }
        if (booking.user.toString() !== req.user.id) {
           return res.status(403).json({ message: 'Not authorized to confirm this booking' });
        }
        booking.status = 'Completed';
        booking.userConfirmed = true;
      }
      // Cancelling
      else if (status === 'Cancelled') {
         if (booking.status === 'Completed' || booking.status === 'In Progress') {
            return res.status(400).json({ message: 'Cannot cancel active or completed bookings' });
         }
         booking.status = 'Cancelled';
      }
      else {
        return res.status(400).json({ message: 'Invalid status update for user' });
      }
    }
    
    // Admin Logic
    else if (req.user.role === 'admin') {
       booking.status = status;
    }

    await booking.save();
    
    // Populate fields for response - Ensure detailed response
    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'username email location')
      .populate('serviceId', 'category basePrice');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

module.exports = {
  getUserBookings,
  getProviderBookings,
  createBooking,
  updateBookingStatus
};
