const express = require('express');
const router = express.Router();
const { debugUsers } = require('../controllers/debugController');

router.get('/users', debugUsers);

module.exports = router;
