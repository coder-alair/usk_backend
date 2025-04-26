const express = require('express');
const { getDriverLocation } = require('../controllers/driver.controller');
const router = express.Router();

router.get('/getLocation', getDriverLocation);


module.exports = router;