const express = require('express');
const router = express.Router();
const { verifyEmailToken } = require('../routes/authRoutes');
const { validateToken } = require('../middleware/validateToken');

router.get('/:token', verifyEmailToken);

module.exports = router;