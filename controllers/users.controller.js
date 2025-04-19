const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bcryptjs = require('bcrypt');
const { validationResult } = require("express-validator");
const Rider = require("../models/rider.models");
const Driver = require("../models/driver.model");
const { errorHandler } = require("../utils/error"); // Import the error handler

const signUp = async (req, res, next) => {
  const { role, fullName, email, password, contactNumber, ...otherDetails } = req.body;

  // Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errorHandler(400, "Validation failed");
    error.details = errors.array(); // Attach validation errors to the error object
    return next(error);
  }

  try {
    // Check if the user already exists
    const existingUser = await (role === "driver" ? Driver : Rider).findOne({ email });
    if (existingUser) {
      const error = errorHandler(400, "Email is already in use.");
      return next(error);
    }

    // Create a new user based on role
    // const hashedPassword = await bcrypt.hash(password, +process.env.PASS_SALT_ROUND);
    const userModel = role === "driver" ? Driver : Rider;

    const user = await userModel.create({
      fullName,
      email,
      password,
      contactNumber,
      ...otherDetails
    });
    console.log("User>>>>\n", user);
    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, role: user.role, email: user.email }
    });

  } catch (err) {
    console.log(err);
    const error = errorHandler(500, "Internal server error");
    error.details = err.message;
    return next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errorHandler(400, "Validation failed");
    error.details = errors.array(); // Attach validation errors to the error object
    return next(error);
  }

  try {
    // Find the user by email and role
    const userModel = role === "driver" ? Driver : Rider;
    console.log("email:", email);
    console.log("password:", password);
    const user = await userModel.findOne({ email });
    if (!user) {
      const error = errorHandler(404, "User not found.");
      return next(error);
    }


    console.log(user, ".....user")

    // Compare passwords
    const validPassword = bcryptjs.compareSync(password, user.password);

    if (!validPassword)
      return next(errorHandler(401, "Wrong credentials!"));

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ENCRYPTION_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, role: user.role, email: user.email, isDocComplete: user.isDocComplete }
    });
  } catch (err) {
    const error = errorHandler(500, "Internal server error");
    console.log(err.message)
    error.details = err.message;
    return next(error);
  }
};

const getDriverDetails = async (req, res, next) => {
  const driverId = req.query.driverId;
  try {
    const driverDetails = await Driver.findOne({ _id: driverId });
    if (!driverDetails) {
      const error = errorHandler(404, "Driver not found.");
      return next(error);
    }
    console.log(driverDetails);
    return res.status(200).json({ success: true, error: false, name: driverDetails.fullName, phone: driverDetails.contactNumber, vehicleNumber: driverDetails.vehicleDetails.numberPlate });
  } catch (err) {
    console.log("error: ", err)
    const error = errorHandler(500, "Internal server error");
    error.details = err.message;
    return next(error);
  }
}

const updateDetails = async (req, res, next) => {
  const { userId, updates, role } = req.body;

  // Validate inputs
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const error = errorHandler(400, "Validation failed");
  //   error.details = errors.array();
  //   return next(error);
  // }

  try {
    // Determine the user model based on role
    const userModel = role === "driver" ? Driver : Rider;

    // Use findOneAndUpdate to update the user
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId }, // Find the user by ID
      { $set: updates }, // Apply the updates
      { new: true, runValidators: true } // Return the updated document
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      const error = errorHandler(404, "User not found.");
      return next(error);
    }
    console.log("up", updatedUser);
    return res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Error updating user details:", err);
    const error = errorHandler(500, "Internal server error");
    error.details = err.message;
    return next(error);
  }
};




module.exports = { signUp, login, getDriverDetails, updateDetails };
