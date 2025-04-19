const mongoose = require("mongoose");
const baseUserSchema = require("./baseUser.model"); // Adjust the path as necessary

const riderSchema = new mongoose.Schema(
  {
    role: { type: String, default: "rider", immutable: true },
  },
  { timestamps: true }
);

const Rider = mongoose.model("Rider", baseUserSchema.clone().add(riderSchema));
module.exports = Rider;
