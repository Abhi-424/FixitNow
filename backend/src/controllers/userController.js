const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, location, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username or email is being changed to an existing one
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    user.username = username || user.username;
    user.email = email || user.email;
    
    // Handle location update (expecting { address, coordinates: [lng, lat] } or just address)
    if (location) {
        // If location is just a string, we might want to geocode it here, 
        // but for now let's assume valid object structure matching schema or just partial update
        if (location.coordinates && location.address) {
             user.location = {
                type: 'Point',
                coordinates: location.coordinates, // [lng, lat]
                address: location.address
             };
        } else if (location.address) {
             // If only address provided, maybe keep old coordinates or just update address?
             // ideally we re-geocode, but let's stick to simple update or expect full object
             user.location.address = location.address;
        }
    }

    if (req.body.availability) {
        user.availability = req.body.availability;
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      location: updatedUser.location,
      status: updatedUser.status,
      availability: updatedUser.availability
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
