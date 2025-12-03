const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, },
    mobile: { type: String, trim: true,  },
    password: { type: String, trim: true, required: true, min: 6, max: 64 },
    address: { type: String, default:"Unknown" },
    image: { type: String, trim: true, url: String, default:"" },
    imageDeleteUrl: { type: String}, // Storing the delete url of the image from imgBB to delete the previously uploaded image from the imgBB while updating the image
    userType: { type: String, default: "User" },
    isAdmin: { type: Boolean, default: false },
    doctors: [
        {
          doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors' },
          name: { type: String, trim: true },
          specialization: { type: String, trim: true },
          education: { type: String, trim: true },
          experience: { type: Number },
          availability: [
            {
              day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
              startTime: { type: Date },
              endTime: { type: Date },
            },
          ],
        },
      ],
    resetCode: String,
  }, { timestamps: true });

  module.exports = mongoose.model('Users', userSchema);