const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  title: { type: String, trim: true },
  email: { type: String, trim: true, },
  mobile: { type: String, trim: true, },
  password: { type: String, trim: true, min: 6, max: 64 },
  userType: { type: String, default: "Doctor" },
  price:{type:Number,default:0},
  addresses: [
    {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: Number },
      availability: [
        {
          day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
          startTime: { type: String },
          endTime: { type: String },
        },
      ],
    },
  ],
  comments: [],
  description: { type: String },
  experience: { type: Number, default: 0 },
  education: { type: String },
  specialization: { type: String, default: 'General Physician' },
  rating: [],
  raters: [],
  image: { type: String, trim: true, default: "" },
  showContact: { type: Boolean, default: false },
  addedBy: { type: String, trim: true, default: 'own' },
  addedType: { type: String, trim: true, default: 'own' },
  resetCode: String,
}, { timestamps: true });

module.exports = mongoose.model('Doctors', doctorSchema);