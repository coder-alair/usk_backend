'use strict';

const router = require('express').Router();
// Importing routes
const userRoutes = require("./user.routes");
const rideRequestRoutes = require('./rideRequest.routes');
const templeteRoutes = require('./templetes.routes');
const adminRoutes = require("./admin.routes");
const razorpayRoutes = require("./razorpay.routes");
const driverRoutes = require("./driver.routes")
// Routes
router.use('/users', userRoutes);
router.use('/rideRequest', rideRequestRoutes);
router.use('/templetes', templeteRoutes);
router.use('/auth', adminRoutes);
router.use('/razorpay', razorpayRoutes);
router.use('/driver', driverRoutes )

module.exports = router;