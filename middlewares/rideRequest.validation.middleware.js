const Joi = require('joi');

const rideRequestValidator = (req, res, next) => {
  const schema = Joi.object({
    riderId: Joi.string().required().messages({
      'string.base': 'Rider ID must be a string',
      'any.required': 'Rider ID is required',
    }),
    pickupLocation: Joi.object({
      latitude: Joi.number().required().messages({
        'number.base': 'Pickup latitude must be a number',
        'any.required': 'Pickup latitude is required',
      }),
      longitude: Joi.number().required().messages({
        'number.base': 'Pickup longitude must be a number',
        'any.required': 'Pickup longitude is required',
      }),
    }).required().messages({
      'any.required': 'Pickup location is required',
    }),
    pickupAddress: Joi.string().required().messages({
      'string.base': 'Pickup address must be a string',
      'any.required': 'Pickup address is required',
    }),
    dropoffLocation: Joi.object({
      latitude: Joi.number().required().messages({
        'number.base': 'Dropoff latitude must be a number',
        'any.required': 'Dropoff latitude is required',
      }),
      longitude: Joi.number().required().messages({
        'number.base': 'Dropoff longitude must be a number',
        'any.required': 'Dropoff longitude is required',
      }),
    }).required().messages({
      'any.required': 'Dropoff location is required',
    }),
    dropoffAddress: Joi.string().required().messages({
      'string.base': 'Dropoff address must be a string',
      'any.required': 'Dropoff address is required',
    }),
    distance: Joi.number().positive().required().messages({
      'number.base': 'Distance must be a number',
      'number.positive': 'Distance must be positive',
      'any.required': 'Distance is required',
    }),
    estimatedTime: Joi.number().positive().required().messages({
      'number.base': 'Estimated time must be a number',
      'number.positive': 'Estimated time must be positive',
      'any.required': 'Estimated time is required',
    }),
    rideArea: Joi.string().optional().allow('').messages({
      'string.base': 'Ride area must be a string',
    }),
    rideType: Joi.string()
      .valid('single', 'multi-stop', 'advance-booking')
      .required()
      .messages({
        'string.base': 'Ride type must be a string',
        'any.only': 'Ride type must be one of [single, multi-stop, advance-booking]',
        'any.required': 'Ride type is required',
      }),
    stops: Joi.array()
      .items(
        Joi.object({
          location: Joi.object({
            latitude: Joi.number().required().messages({
              'number.base': 'Stop latitude must be a number',
              'any.required': 'Stop latitude is required',
            }),
            longitude: Joi.number().required().messages({
              'number.base': 'Stop longitude must be a number',
              'any.required': 'Stop longitude is required',
            }),
          }).required(),
          address: Joi.string().required().messages({
            'string.base': 'Stop address must be a string',
            'any.required': 'Stop address is required',
          }),
          stopTime: Joi.date().optional().messages({
            'date.base': 'Stop time must be a valid date',
          }),
        })
      )
      .optional()
      .messages({
        'array.base': 'Stops must be an array of objects',
      }),
    advanceBookingDetails: Joi.object({
      scheduledPickupTime: Joi.date()
        .required()
        .when('rideType', {
          is: 'advance-booking',
          then: Joi.required().messages({
            'date.base': 'Scheduled pickup time must be a valid date',
            'any.required': 'Scheduled pickup time is required for advance bookings',
          }),
          otherwise: Joi.optional(),
        }),
      additionalNotes: Joi.string().optional().allow('').messages({
        'string.base': 'Additional notes must be a string',
      }),
    })
      .optional()
      .messages({
        'object.base': 'Advance booking details must be an object',
      }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

module.exports = rideRequestValidator;