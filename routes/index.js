'use strict';

const router = require('express').Router();
const apiRoute = require('./api.routes');

// Health check
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is working' });
});

// API routes
router.use('/api', apiRoute);

module.exports = router;
