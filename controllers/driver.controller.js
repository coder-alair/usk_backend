const rideRequestModel = require('../models/rideRequest.model');
const Response = require('../utils/Response')


module.exports = {
    getDriverLocation: async (req, res) => {
        try {
            const { tripId } = req.query;
            if (!tripId) {
                return Response.errorResponseWithoutData(res, "Trip not found");
            }

            const trip = await rideRequestModel.findById(tripId).populate('driverId');
            if (!trip) {
                return Response.errorResponseWithoutData(res, "Trip not found");
            }
            if (!trip?.driverId) {
                return Response.errorResponseWithoutData(res, "Trip not accepted");
            }

            return Response.successResponseData(res, trip?.driverId?.location, 1,"Driver location successful");
        } catch (err) {
            console.log({err})
            return Response.internalServerErrorResponse(res);
        }
    },
};
