const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService
} = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Get all services - public route
router.get('/', getAllServices);

// Get single service - public route
router.get('/:id', getServiceById);

// Create service - admin only
router.post('/', protect, adminOnly, createService);

module.exports = router;
