// routes/ride.js
const express = require('express');
const router = express.Router();
const RideRequest = require('../models/riderequest');
const User = require('../models/user');

// Helper function to calculate distance (Haversine formula)
const calculateDistance = (loc1, loc2) => {
  const radlat1 = Math.PI * loc1.latitude / 180;
  const radlat2 = Math.PI * loc2.latitude / 180;
  const theta = loc1.longitude - loc2.longitude;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515; // Convert to miles; for kilometers, multiply by 1.609344
  return dist;
};

// Book a cab API endpoint
router.post('/book-cab', async (req, res) => {
  const { userId, pickupLocation } = req.body;

  try {
    // Step 1: Validate user
    const user = await User.findById(userId);
    if (!user || user.role !== 'user') return res.status(404).json({ message: 'Invalid user or role' });

    // Step 2: Find nearest available driver
    const availableDrivers = await User.find({ role: 'driver', isAvailable: true, status: 'on-duty' });
    let nearestDriver = null;
    let minDistance = Infinity;

    availableDrivers.forEach(driver => {
      const distance = calculateDistance(pickupLocation, driver.currentLocation);
      if (distance < minDistance) {
        minDistance = distance;
        nearestDriver = driver;
      }
    });

    if (!nearestDriver) return res.status(404).json({ message: 'No available drivers nearby' });

    // Step 3: Create a ride request
    const rideRequest = await RideRequest.create({
      userId,
      driverId: nearestDriver._id,
      pickupLocation,
      status: 'pending',
    });

    // Step 4: Notify the driver (this could be a WebSocket or push notification in a real app)
    console.log(`Notification sent to driver ${nearestDriver.name} for a new ride request.`);

    res.status(200).json({ message: 'Ride booked successfully', rideRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error booking the cab', error: error.message });
  }
});

module.exports = router;
