const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    title: { type: String, trim: true },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true },
    password: { type: String, trim: true, min: 6, max: 64 },
    userType: { type: String, default: "Doctor" },
    price: { type: Number, default: 0 },
    comments: [],
    description: { type: String },
    experience: { type: Number, default: 0 },
    education: { type: String },
    specialization: { type: String, default: "General Physician" },
    rating: [{ type: Number }], // all individual ratings
    raters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // all users who rated
    avgRating: { type: Number, default: 0 }, // ✅ precomputed field
    totalRatings: { type: Number, default: 0 }, // ✅ count of ratings
    image: { type: String, trim: true, default: "" },
    showContact: { type: Boolean, default: false },
    addedBy: { type: String, trim: true, default: "own" },
    ownerEmail: { type: String },
    addedType: { type: String, trim: true, default: "own" },
    clinic:{type:String}, //Storing clinic ID for show the clinic details
    resetCode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
