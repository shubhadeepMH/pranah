const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true,  },
    mobile: { type: String, trim: true,},
    title: { type: String, trim: true, default:"Healthcare Service"},
    password: { type: String, trim: true, required: true, min: 6, max: 64 },
    address: { type: String, default: "Unknown" },
    image: { type: String, trim: true, default: "" },
    userType: { type: String, default: "Clinic" },
    rating: [],
    raters:[],
    comments:[],
    resetCode: String,
  }, { timestamps: true });
  
  module.exports = mongoose.model('Clinics', clinicSchema);