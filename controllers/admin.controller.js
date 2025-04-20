const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AddUser = require("../models/addNewUser.schema");
const Register = require("../models/register.schema");
const Kyc = require("../models/Kyc");

const JWT_SECRET = process.env.ENCRYPTION_SECRET;


const roles = ["Super Admin", "State Admin", "District Admin"];
const states = ["State A", "State B", "State C"];
const districts = {
    "State A": ["District 1", "District 2"],
    "State B": ["District 3", "District 4"],
    "State C": ["District 5", "District 6"],
};


module.exports = {
    getRoles: (req, res) => {
        res.status(200).json(roles);
    },
    getStates: (req, res) => {
        res.status(200).json(states);
    },
    getDistrictsStates: (req, res) => {
        const { state } = req.params;
        const districtList = districts[state] || [];
        res.status(200).json(districtList);
    },
    getHeirarchy: (req, res) => {
        const { role, state, district } = req.query;

        // Example logic (replace with database queries)
        let data;
        if (role === "Super Admin") {
            data = { message: "Full admin access" };
        } else if (role === "State Admin" && states.includes(state)) {
            data = { message: `State-level data for ${state}` };
        } else if (
            role === "District Admin" &&
            districts[state]?.includes(district)
        ) {
            data = { message: `District-level data for ${district}, ${state}` };
        } else {
            data = { message: "No data found for the specified role and region" };
        }

        res.status(200).json(data);
    },
    signupAdmin: async (req, res) => {
        const { firstName, lastName, email, password, referralCode, role } = req.body;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                referralCode,
                role,
            });

            await user.save();

            // Remove sensitive data before returning the user
            const userToReturn = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                referralCode: user.referralCode,
                role: user.role,
            };

            res
                .status(201)
                .json({ message: "User registered successfully", user: userToReturn });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },
    loginAdmin: async (req, res) => {
        const { email, password, role } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // if (user.role !== role) {
            //   return res.status(400).json({ message: "Invalid role" });
            // }

            const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
                expiresIn: "1d",
            });
            res.status(200).json({
                token,
                role: user.role,
                user,
                message: "Login successful",
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },
    getUser: async (req, res) => {
        const { currentUserId } = req.params;
        try {
            const codes = await AddUser.find({ currentUserId });
            const codeArray = codes.map((code) => code.referralCode);
            const users = await User.find({ referralCode: { $in: codeArray } });

            res.status(200).json({ users });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },
    addUser: async (req, res) => {
        const { email, phone, referralCode, currentUserId } = req.body;
        try {
            const existingUser = await AddUser.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }
            const newUser = new AddUser({ email, phone, referralCode, currentUserId });
            const hashedPassword = await bcrypt.hash("12345678", 10);
            const payload = {
                firstName: email.split("@")[0],
                lastName: email.split("@")[0],
                phoneNumber: phone,
                referralCode: referralCode,
                password: hashedPassword,
                email: email,
                // role: "",
            }
            const newUser1 = await User.create(payload);
            await newUser.save();

            res.status(201).json({ message: "User added successfully", newUser });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server error" });
        }
    },
    registerAdmin: async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            dob,
            permanentAddress,
            experience,
            education,
            certificates,
            companyName,
            companyAddress,
            website,
            currentSalary,
            targetSalary,
        } = req.body;

        try {
            const parsedDob = new Date(dob.split("/").reverse().join("-"));
            const user = new Register({
                firstName,
                lastName,
                email,
                dob: parsedDob,
                permanentAddress,
                experience,
                education,
                certificates,
                companyName,
                companyAddress,
                website,
                currentSalary,
                targetSalary,
            });

            await user.save();
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            res
                .status(400)
                .json({ message: "Registration failed", error: error.message });
        }
    },
    submitKyc: async (req, res) => {
        const { aadharNumber, panNumber, otp } = req.body;

        try {
            const kycData = new Kyc({
                // userId,
                aadharNumber,
                panNumber,
                otp,
                // aadharFront,
                // aadharBack,
                // panFron,
            });

            await kycData.save();
            res.status(200).json({ message: "KYC submitted successfully." });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error submitting KYC", error: error.message });
        }
    }

};