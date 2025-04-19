const RideRequest = require('../models/rideRequest.model');
const Rider = require('../models/rider.models');
const Driver = require('../models/driver.model');
const {io} = require("../index");
const BASE_FARE = 50; // Base fare
const DISTANCE_RATE = 10; // Rate per km
const TIME_RATE = 2; // Rate per minute
const SURGE_MULTIPLIER = 1.5; // Surge multiplier for high-demand periods
const HIGH_DEMAND_THRESHOLD = 50; // Requests in the last 10 minutes for high-demand flag

// Create a new ride request (for riders)
exports.createRequest = async (req, res) => {
    const {
        riderId,
        pickupLocation,
        pickupAddress,
        dropoffLocation,
        dropoffAddress,
        distance,
        estimatedTime,
        rideArea,
        rideType,
        stops, // Stops array for multi-stop rides
        advanceBookingDetails, // Details for advance booking
    } = req.body;
    
    try {
        // Validate rider existence
        const rider = await Rider.findById(riderId);
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found!" });
        }

        // Check high-demand flag
        const highDemandFlag = await getRequestsFromLast10Minutes() > HIGH_DEMAND_THRESHOLD;

        // Validate inputs
        if (typeof distance !== 'number' || typeof estimatedTime !== 'number') {
            return res.status(400).json({ success: false, message: "Invalid distance or estimated time." });
        }

        // Calculate estimated fare
        const estimatedFare = await calculateRideFare(distance, 0, 0, rideArea, highDemandFlag, 0, estimatedTime);

        if (isNaN(estimatedFare) || estimatedFare < 0) {
            return res.status(400).json({ success: false, message: "Calculated fare is invalid." });
        }
        console.log(">>>>>>>>>>>>>>>>>.", rideType)
        // Build ride request object
        const rideRequestData = {
            userId: riderId,
            name: rider.fullName,
            pickupLocation,
            pickupAddress,
            dropoffLocation,
            dropoffAddress,
            distance,
            estimatedTime,
            fare: estimatedFare,
            rideArea,
            rideType,
            advanceBookingDetails, // Details for advance booking
        };

        if (rideType === "multi-stop" && stops) {
            rideRequestData.stops = stops;
        }

        if (rideType === "advance-booking" && advanceBookingDetails) {
            rideRequestData.advanceBookingDetails = advanceBookingDetails;
        }

        // Create ride request
        const request = await RideRequest.create(rideRequestData);

        // Emit ride request to drivers in the relevant area
        const room = rideArea || "defaultRoom";
        io.to(room).emit("newRideRequest", request);

        return res.status(200).json({
            success: true,
            message: "Ride request created successfully",
            requestDetails: request,
        });
    } catch (error) {
        console.error("Error creating ride request:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Fetch ride requests (for drivers)
exports.getRequest = async (req, res) => {
    const { driverId, driverLat, driverLng } = req.query;

    try {
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, error: true, message: "Driver not found!" });
        }
        if (!driverLat || !driverLng) {
            return res.status(400).json({ success: false, error: true, message: "Driver location not provided." });
        }

        const ongoingRequest = await RideRequest.findOne({
            driverId,
            status: { $in: ['confirmed', 'started'] }
        });

        if (ongoingRequest) {
            return res.status(200).json({
                success: true,
                error: false,
                message: "Ongoing request found",
                request: ongoingRequest
            });
        }

        const pendingRequests = await RideRequest.find({ status: 'pending' });
        const nearbyRequests = pendingRequests.filter((request) =>
            isWithinRadius(driverLat, driverLng, request.pickupLocation, 3)
        );

        return res.status(200).json({
            success: true,
            error: false,
            message: "Nearby pending requests found",
            requests: nearbyRequests
        });
    } catch (error) {
        console.error("Error fetching nearby ride requests:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update ride requests (for drivers and riders)
exports.updateRequest = async (req, res) => {
    const { requestId, driverId, riderId, status, confirmOtp, driverLocation, stopIndex } = req.body;

    try {
        const request = await RideRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, error: true, message: "Request not found" });
        }

        const rider = await Rider.findById(riderId);
        if (!rider) return res.status(404).json({ success: false, error: true, message: "Rider not found" });

        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ success: false, error: true, message: "Driver not found" });

        // Handle advance booking: check scheduled pickup time
        if (request.rideType === 'advance-booking' && status === 'started') {
            const now = new Date();
            const scheduledTime = new Date(request.advanceBookingDetails.scheduledPickupTime);
            if (now < scheduledTime) {
                return res.status(400).json({
                    success: false,
                    error: true,
                    message: "Cannot start the ride before the scheduled pickup time.",
                });
            }
        }

        // Handle multi-stop: update stop progress
        if (request.rideType === 'multi-stop' && stopIndex !== undefined) {
            if (!request.stops[stopIndex]) {
                return res.status(400).json({ success: false, error: true, message: "Invalid stop index." });
            }
            request.stops[stopIndex].completed = true; // Mark the stop as completed
            await request.save();

            io.to(`rider_${riderId}`).emit("stopCompleted", { requestId, stopIndex });
            return res.status(200).json({ success: true, error: false, message: "Stop completed." });
        }

        // Handle ride statuses
        if (status === "confirmed") {
            const otp = generateOTP();
            await RideRequest.findByIdAndUpdate(requestId, { driverId, status, otp, driverLocation });

            io.to(`rider_${riderId}`).emit("rideConfirmed", { requestId, driverId });
            return res.status(200).json({ success: true, error: false, message: "Ride accepted." });
        }

        if (status === 'started') {
            if (!confirmOtp || request.otp != confirmOtp) {
                return res.status(401).json({ success: false, error: true, message: "OTP missing or mismatched" });
            }
            await RideRequest.findByIdAndUpdate(requestId, { status, driverLocation });

            io.to(`rider_${riderId}`).emit("rideStarted", { requestId });
            return res.status(200).json({ success: true, error: false, message: "Ride started." });
        }

        if (status === 'completed') {
            const fare = await calculateRideFare(
                request.distance,
                request.startTime,
                new Date(),
                request.rideArea,
                false,
                request.stops.length * 5,
                request.estimatedTime
            );
            await RideRequest.findByIdAndUpdate(requestId, { status, fare, endTime: new Date() });

            io.to(`rider_${riderId}`).emit("rideCompleted", { requestId });
            io.to(`driver_${driverId}`).emit("rideCompleted", { requestId });
            return res.status(200).json({ success: true, error: false, message: "Ride completed and fare calculated." });
        }

        if (driverLocation) {
            await RideRequest.findByIdAndUpdate(requestId, { driverLocation });
            io.to(`rider_${riderId}`).emit("driverLocation", { driverId, driverLocation });
            return res.status(200).json({ success: true, message: "Location updated." });
        }
    } catch (error) {
        console.error("Error updating ride request:", error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get updates for a specific ride request
exports.getUpdates = async (req, res) => {
    const { requestId } = req.query
    try {
        const request = await RideRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, error: true, message: "Request not found" });
        }

        return res.status(200).json({
            success: true,
            error: false,
            message: "Ride updates retrieved",
            request
        });

    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ success: false, error: true, message: "Internal Server Error" });
    }
};

// Helper functions
async function calculateRideFare(distance, startTime = 0, endTime = 0, rideArea, highDemandFlag, additionalFees = 0, estimatedTime) {
    const timeInMins = startTime && endTime ? Math.ceil((endTime - startTime) / (1000 * 60)) : estimatedTime;
    const surgeMultiplier = getSurgeMultiplier(new Date().getHours(), rideArea, highDemandFlag);
    return calculateFare(distance, timeInMins, surgeMultiplier);
}

function calculateFare(distance, timeInMins, surgeMultiplier) {
    const subtotal = BASE_FARE + (distance * DISTANCE_RATE) + (timeInMins * TIME_RATE);
    return Math.round(subtotal * surgeMultiplier * 100) / 100;
}

function getSurgeMultiplier(currentHour, area, isHighDemand) {
    const peakHours = [7, 8, 9, 17, 18, 19, 20];
    const highDemandAreas = ["Downtown", "Airport"];
    return peakHours.includes(currentHour) || highDemandAreas.includes(area) || isHighDemand ? SURGE_MULTIPLIER : 1;
}

async function getRequestsFromLast10Minutes() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequests = await RideRequest.find({ createdAt: { $gte: tenMinutesAgo } });
    return recentRequests.length;
}

function isWithinRadius(lat1, lon1, location2, radiusKm) {
    const distance = calculateDistance(lat1, lon1, location2.latitude, location2.longitude);
    return distance <= radiusKm;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}
