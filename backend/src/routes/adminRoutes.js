const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAllUsers, 
  getAllProviders, 
  updateUserStatus 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// All routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/providers', getAllProviders);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
