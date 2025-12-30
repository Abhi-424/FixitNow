const express = require('express');
const router = express.Router();
const { 
  submitContactForm, 
  getAllMessages, 
  updateMessageStatus,
  getUnreadCount
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/', submitContactForm);
router.get('/unread', protect, adminOnly, getUnreadCount);
router.get('/', protect, adminOnly, getAllMessages);
router.patch('/:id', protect, adminOnly, updateMessageStatus);

module.exports = router;
