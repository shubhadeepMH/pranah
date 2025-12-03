const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, },
  mobile: { type: String, trim: true, },
  title: { type: String, trim: true, default: "Healthcare Service" },
  password: { type: String, trim: true, min: 6, max: 64 },
  addressLine: { type: String, default: "Unknown" },
  city: { type: String },
  state: { type: String },
  pinCode: { type: Number },
  image: { type: String, trim: true, default: "" },
  imageDeleteUrl: { type: String},  // Storing the delete url of the image from imgBB to delete the previously uploaded image from the imgBB while updating the image
  userType: { type: String, default: "Clinic" },
  addedBy: { type: String, trim: true, default: 'Self' }, //There will be only three options Own, Admin, User
  ownerEmail: { type: String }, // If Clinic Added by any user or Admin its necesssary to track 
  description: { type: String },
  // ✅ Store doctor IDs (string only, no ref) to show doctors list
  doctors: [{ type: String }],
  rating: [],
  raters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // all users who rated
  avgRating: { type: Number, default: 0 }, // ✅ precomputed field
  totalRatings: { type: Number, default: 0 }, // ✅ count of ratings
  clinicType: { type: String },
  resetCode: String,
}, { timestamps: true });

module.exports = mongoose.model('Clinics', clinicSchema);