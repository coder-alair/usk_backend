const express = require('express');
const { getQRCode } = require('../controllers/razorpay.controller');
const router = express.Router();

router.post('/getQR', getQRCode);

module.exports = router;