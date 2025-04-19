const { check, body } = require("express-validator");

const validateSignUp = [
  check("fullName").notEmpty().withMessage("Full name is required."),
  check("email").isEmail().withMessage("Invalid email."),
  check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  check("contactNumber").isMobilePhone().withMessage("Invalid contact number."),
  check("role").isIn(["rider", "driver"]).withMessage("Role must be 'rider' or 'driver'.")
];

const validateLogin = [
  check("email").isEmail().withMessage("Invalid email."),
  check("password").notEmpty().withMessage("Password is required."),
  check("role").isIn(["rider", "driver"]).withMessage("Role must be 'rider' or 'driver'.")
];



//
const validateUpdateDetails = [
  // Ensure `userId` is provided and is a valid MongoDB ObjectId
  check("userId").isMongoId().withMessage("Invalid user ID."),

  // Validate role
  check("role").isIn(["rider", "driver"]).withMessage("Role must be 'rider' or 'driver'."),

  // Optional fields for updates
  body("updates.fullName")
    .optional()
    .notEmpty()
    .withMessage("Full name cannot be empty."),
  
  body("updates.email")
    .optional()
    .isEmail()
    .withMessage("Invalid email."),
  
  body("updates.contactNumber")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid contact number."),
  
  // Conditional validation for driver vehicle details
  body("updates.vehicleDetails")
    .optional()
    .isObject()
    .withMessage("Vehicle details must be an object.")
    .custom((value) => {
      const requiredFields = ["make", "model", "year", "color", "RC", "numberPlate", "insuranceExpiry"];
      const missingFields = requiredFields.filter((field) => !(field in value));

      if (missingFields.length) {
        throw new Error(`Missing required vehicle details: ${missingFields.join(", ")}`);
      }

      return true;
    }),
  
  // Validate specific fields within `vehicleDetails`
  body("updates.vehicleDetails.numberPlate")
    .optional()
    .matches(/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/)
    .withMessage("Invalid number plate format."),
  
  body("updates.vehicleDetails.insuranceExpiry")
    .optional()
    .isISO8601()
    .withMessage("Insurance expiry must be a valid date (ISO 8601 format).")
];


module.exports = { validateSignUp, validateLogin, validateUpdateDetails };
