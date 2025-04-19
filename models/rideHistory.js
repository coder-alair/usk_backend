const mongoose = require('mongoose');

const rideHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    pickupAddress: {
        type: String,
        required: true,
    },
    dropOffAddress: {
        type: String,
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    totalfare: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    rating:{
        type:Number,
        required:false
    }
})