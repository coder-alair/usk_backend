const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AddUser = require("../models/addNewUser.schema");
const Register = require("../models/register.schema");
const Kyc = require("../models/Kyc");
const { sendCredentialsEmail } = require("../utils/emailService");
const { generatePassword, makeRandomString, makeRandomDigit } = require("../utils/helper");
const Driver = require("../models/driver.model");

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
            if (!role) {
                return res.status(400).json({ message: `Please enter your role` });
            }

            const user = await User.findOne({
                $or: [
                    { email: email },
                    { phone: email }
                ]
            });

            if (!user) {
                return res.status(400).json({ message: "Invalid email/phone or password" });
            }

            if (user.role !== role) {
                return res.status(400).json({ message: `Your role is not ${role}` });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
                expiresIn: "1d",
            });

            return res.status(200).json({
                token,
                role: user.role,
                user,
                message: "Login successful",
            });
        } catch (error) {
            console.log(error)
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
        const { email, phone, userType,isReferred, category, subCategory, referralCode, currentUserId } = req.body;
        try {
            
            const categories = ["driver", "electrician"];
            if(!categories.includes(userType)){
                console.log(!category.includes(userType))
                const existingRole = await User.findOne({ role: userType});
                if (existingRole) {
                    return res.status(400).json({ message: "Role already occupied" });
                }
            }
            const existingUser = await AddUser.findOne({ email, phone: phone });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }
            const newUser = new AddUser({ email, phone, referralCode, currentUserId });
            const password = makeRandomString(3) + makeRandomDigit(2) + makeRandomString(3);
            const hashedPassword = await bcrypt.hash(password, 10);
            const payload = {
                firstName: email.split("@")[0],
                lastName: "",
                phoneNumber: phone,
                referralCode: referralCode,
                password: hashedPassword,
                email: email,
                role: userType,
                category,
                subCategory
            }

            const newUser1 = await User.create(payload);
            await newUser.save();
            if (userType == 'driver') {
                const driver = await Driver.create({
                    fullName: email.split("@")[0],
                    email,
                    password: hashedPassword,
                    contactNumber: phone,
                    isReferred
                });
                await driver.save();
            }
            sendCredentialsEmail({
                toEmail: email,
                toName: payload?.firstName,
                email: email,
                phone: phone,
                password: password
            })

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
            console.log({ error })
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
    },
    getGpnUsers: async (req, res) => {
        try {
            const drivers = await Driver.find().sort({ createdAt: -1 });

            console.log({ drivers })
            return res.status(200).json({
                success: true,
                error: false,
                message: "drivers retrieved",
                data: drivers
            });

        } catch (error) {
            console.error("Internal server error:", error);
            return res.status(500).json({ success: false, error: true, message: "Internal Server Error" });
        }
    }

};