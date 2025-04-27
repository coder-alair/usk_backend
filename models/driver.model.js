const mongoose = require("mongoose");
const baseUserSchema = require("./baseUser.model"); // Adjust the path as necessary

const numberPlateRegex = /^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/;

const driverSchema = new mongoose.Schema(
  {
    role: { type: String, default: "driver", immutable: true },
    isAvailable: { type: Boolean, default: false },
    isReferred:{ type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    vehicleDetails: {
      make: { type: String },
      model: { type: String },
      year: { type: Number },
      color: { type: String },
      RC: { type: String },
      numberPlate: {
        type: String,
        // validate: {
        //   validator: (v) => !v || numberPlateRegex.test(v), // Allow empty or valid number plates
        //   message: (props) => `${props.value} is not a valid number plate!`
        // }
      },
      insuranceExpiry: { type: Date },
    },
    status: {
      type: String,
      enum: ["on-duty", "off-duty", "on-trip", "break"],
      default: "off-duty"
    }
  },
  { timestamps: true }
);

// Virtual field to calculate if documents are complete
driverSchema.virtual("isDocComplete").get(function () {
  const { vehicleDetails } = this;
  if (
    vehicleDetails &&
    vehicleDetails.make &&
    vehicleDetails.model &&
    vehicleDetails.year &&
    vehicleDetails.color &&
    vehicleDetails.RC &&
    vehicleDetails.numberPlate &&
    vehicleDetails.insuranceExpiry
  ) {
    return true;
  }
  return false;
});

// Ensure virtuals are included in JSON responses
driverSchema.set("toJSON", { virtuals: true });
driverSchema.set("toObject", { virtuals: true });

const Driver = mongoose.model("Driver", baseUserSchema.clone().add(driverSchema));
module.exports = Driver;
