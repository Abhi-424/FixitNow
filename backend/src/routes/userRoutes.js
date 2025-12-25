const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// All user routes require authentication
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

module.exports = router;
