const mongoose = require("mongoose");
const { genSalt, hash, compare } = require("bcrypt");

const phoneRegex = /^[+91]?\d{10}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const nameRegex = /^[A-Za-z\s]+$/;

const baseUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return nameRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid full name!`
      }
    },
    contactNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return phoneRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid contact number!`
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return emailRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`
      }
    },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Pre-save hook to hash the password
baseUserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await genSalt(+process.env.PASS_SALT_ROUND);
      this.password = await hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Method to compare passwords
baseUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await compare(candidatePassword, this.password);
};

// Remove sensitive data from output
baseUserSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = baseUserSchema;
