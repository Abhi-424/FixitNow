const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getAllServicesAdmin,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Get all active services - public route
router.get('/', getAllServices);

// Get all services including inactive - admin only
router.get('/admin/all', protect, adminOnly, getAllServicesAdmin);

// Get single service - public route
router.get('/:id', getServiceById);

// Create service - admin only
router.post('/', protect, adminOnly, createService);

// Update/Delete Service - admin only
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
