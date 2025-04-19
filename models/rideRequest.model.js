const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rideType: {
    type: String,
    enum: ['single', 'multi-stop', 'advance-booking'],
    default: 'single', // Default to single-stop ride
  },
  pickupLocation: {
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    }, 
    required: true,
  },
  pickupAddress: { type: String, required: true },
  stops: {
    type:[
    {
      location: {
        latitude: { type: Number  },
        longitude: { type: Number  },
        address: { type: String },
        stopTime: { type: Date },
      }
    },
    
  ],
  required:function(){ return this.rideType === "multi-stop"}
},
  dropoffLocation: {
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    required: true,
  },
  dropoffAddress: { type: String, required: true },
  driverLocation: {
    type: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  fare: { type: Number, required: true },
  otp: {
    type: Number,
    required: function () {
      return this.status === 'started';
    }, // OTP required only when status is 'started'
  },
  distance: {
    type: Number,
    required: true,
    // Distance in kilometers or miles (based on the app's unit)
  },
  estimatedTime: {
    type: Number,
    required: true,
    // Estimated time in minutes
  },
  advanceBookingDetails: {
    scheduledPickupTime: { type: Date, required: function () { return this.rideType === 'advance-booking'; } },
    additionalNotes: { type: String }, // Optional: Any special instructions for the ride
  },
  rating: {
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
  },
  requestTime: { type: Date, default: Date.now, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'scheduled', 'started', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to handle status changes and time recording
rideRequestSchema.pre('save', function (next) {
  // Handle advance booking status transition
  if (this.rideType === 'advance-booking' && this.status === 'pending' && this.advanceBookingDetails?.scheduledPickupTime) {
    this.status = 'scheduled';
  }

  // Set startTime when OTP is provided
  if (this.otp && this.status === 'pending') {
    this.status = 'started';
    this.startTime = new Date();
  }

  // Set endTime only when status is changed to 'completed'
  if (this.isModified('status') && this.status === 'completed') {
    this.endTime = new Date();
  } else if (this.isModified('status') && this.status !== 'completed') {
    // Clear endTime if status is not 'completed' and it's being modified
    this.endTime = undefined;
  }

  next();
});

module.exports = mongoose.model('RideRequest', rideRequestSchema);
