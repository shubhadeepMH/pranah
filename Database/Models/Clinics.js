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
    addedBy: { type: String, trim: true, default: 'own' }, //There will be only three options Own, Admin, User
    ownerEmail: { type: String}, // If Clinic Added by any user or Admin its necesssary to track 
    description: {type: String},
    rating: [],
    raters:[],
    comments:[],
    resetCode: String,
  }, { timestamps: true });
  
  module.exports = mongoose.model('Clinics', clinicSchema);