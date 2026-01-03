const User = require('../models/User');
const Booking = require('../models/Booking'); 

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalBookings = await Booking.countDocuments();
    
    // Aggregation for earnings (optional but good for admin)
    // const totalEarnings = await Booking.aggregate([{ $match: { status: 'Completed' } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);

    res.status(200).json({
      users: totalUsers,
      providers: totalProviders,
      bookings: totalBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users (customers)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all providers
// @route   GET /api/admin/providers
// @access  Private/Admin
const getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user status (block/unblock/verify)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Role specific validation
    if (user.role === 'provider' && !['Pending', 'Verified', 'Blocked'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status for provider' });
    }
    
    if (user.role === 'user' && !['Active', 'Blocked', 'Pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status for user' });
    }

    // Apply Status Update
    user.status = status;
    await user.save();
    
    // GOVERNANCE: If blocking a provider/user, should we cancel active bookings?
    // For now, let's just log it. In a real system we would trigger a cancellation flow.
    if (status === 'Blocked') {
       console.log(`Governance: User ${user.email} was blocked. Check for active bookings.`);
    }

    res.status(200).json({ message: `User updated to ${status}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all bookings (Admin View)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'username email')
            .populate('provider', 'username email rating status role')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
};

// @desc    Admin update booking status (Intervention)
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private/Admin
const adminUpdateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Cancelled', 'Pending' (Reset), 'Completed' (Force)

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Admin override - no strict logical checks, but maybe logging
        console.log(`Admin intervention: Changing booking ${id} from ${booking.status} to ${status}`);
        
        booking.status = status;
        
        // Reset flags if resetting to Pending
        if (status === 'Pending') {
            booking.provider = null;
            booking.technicianCompleted = false;
            booking.userConfirmed = false;
        }

        await booking.save();
        
        const updatedBooking = await Booking.findById(id)
            .populate('user', 'username email')
            .populate('provider', 'username email');
            
        res.json(updatedBooking);

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Failed to update booking status' });
    }
};


module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllProviders,
  updateUserStatus,
  getAllBookings,
  adminUpdateBookingStatus
};
