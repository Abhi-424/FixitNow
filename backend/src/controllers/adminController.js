const User = require('../models/User');
// Assuming we might have Booking/Service models later, importing for future use if needed.
// const Booking = require('../models/Booking'); 

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    
    // For now, these are placeholders until we have full Booking implementation
    const totalBookings = 0; // await Booking.countDocuments();
    
    // Example logical aggregation or simply returning counts
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
    const users = await User.find({ role: 'user' }).select('-password');
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
    const providers = await User.find({ role: 'provider' }).select('-password');
    res.status(200).json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user status (block/unblock/verify) - Placeholder logic as User model update might be needed
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    // This assumes your User model has a 'status' field or similar. 
    // If not, we might just be deleting or adding a field. 
    // For now let's assume we are adding a custom status field if it doesn't exist schema-wise, 
    // purely for the logic demonstration.
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Dynamic field update
    user.status = status; 
    // Note: If 'status' isn't in Mongoose schema, you must add it or use strict: false 
    // But usually projects add a status field. Let's assume schema update or flexibility.
    
    await user.save();
    res.status(200).json({ message: `User updated to ${status}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllProviders,
  updateUserStatus
};
