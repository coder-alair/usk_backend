const { User } = require('../models/user.models');

const bcryptjs=require('bcrypt');
const jwt=require('jsonwebtoken');
const { errorHandler } = require('../utils/error');

exports.signUp = async (req, res) => {
    const { fullName, email, contactNumber, password, role, referralCode, vehicleDetails } = req.body;

    try {
        // Check if the user exists with the email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already registered with this email" });
        }

        // Create a new user
        const newUser = await User.create({
            fullName,
            email,
            contactNumber,
            password,
            role,
            vehicleDetails:vehicleDetails??null,
            referralCode: referralCode ?? ""
        });

       // await newUser.save();
        return res.status(201).json(newUser);

    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errorMessages.join(', ') });
        }
        // Handle other types of errors (e.g., database errors)
        return res.status(500).json({ message: "An error occurred while creating the user" });
    }
};


exports.signin = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email,".................",password);
    try {
      const validUser = await User.findOne({ email });
      if (!validUser)
         return next(errorHandler(404, "User not found!"));
        
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) 
        return next(errorHandler(401, "Wrong credentials!"));
     
      const token = jwt.sign({ id: validUser._id },  process.env.JWT_SECRET);
      const { password: pass, ...rest } = validUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(201)
        .json(rest);
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errorMessages.join(', ') });
        }
        // Handle other types of errors (e.g., database errors)
        return res.status(500).json({ message: "An error occurred while creating the user" });
    }
  };
