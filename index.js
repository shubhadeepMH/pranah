const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const doctorSchema = require('./Database/Models/Doctors.js')
const clinicSchema = require('./Database/Models/Clinics.js')
const userSchema = require('./Database/Models/Users.js')
const addressesSchema = require('./Database/Models/doctorAddresses.js')
const clinicDoctorSchema = require('./Database/Models/ClinicDoctors.js')
const doctorCommentsSchema = require('./Database/Models/doctorComments.js')
const clinicCommentsSchema = require('./Database/Models/clinicComments.js');

// const doctorAddresses = require('./Database/Models/doctorAddresses.js');


let PORT = 5007 || process.env.PORT


// Middlewears
app.use(cors());
app.use(express.json());




mongoose.connect('mongodb+srv://e-sellers:2JSIH4wypnypujbD@cluster0.udmk0hg.mongodb.net/Pranah', { useUnifiedTopology: true });

// Doctor SignUp
app.post('/doctor_signUp', async (req, res) => {

  try {
    const { name, mobile, email, password } = req.body;

    // Check if email already exists in any schema
    const emailExists =
      await doctorSchema.findOne({ email }) ||
      await userSchema.findOne({ email }) ||
      await clinicSchema.findOne({ email });

    // Check if mobile already exists in any schema
    const mobileExists =
      await doctorSchema.findOne({ mobile }) ||
      await userSchema.findOne({ mobile }) ||
      await clinicSchema.findOne({ mobile });

    // Handle duplicate email or mobile
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (mobileExists) {
      return res.status(400).json({ error: 'Mobile number already exists' });
    }

    // Create new doctor
    const doctor = new doctorSchema({ name, mobile, email, password });
    await doctor.save();

    res.json({ message: 'Doctor signed up successfully', success: true });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }

});

// Update Doctor Profile

app.put('/doctor_profile_update', async (req, res) => {
  try {
    const { id: doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const {
      name,
      email,
      title,
      mobile,
      description,
      experience,
      education,
      specialization,
      image,
      showContact,
      imageDeleteUrl,
      fees,
      clinicId // ✅ OPTIONAL (safe now)
    } = req.body;

    // ✅ Build update object safely (NO undefined values)
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (title !== undefined) updateData.title = title;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (description !== undefined) updateData.description = description;
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (image !== undefined) updateData.image = image;
    if (imageDeleteUrl !== undefined) updateData.imageDeleteUrl = imageDeleteUrl;
    if (showContact !== undefined) updateData.showContact = showContact;

    // ✅ MOST IMPORTANT FIX — fees handling
    if (fees !== undefined && fees !== "") {
      updateData.fees = Number(fees);
    }

    const doctor = await doctorSchema.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      {
        new: true,
        runValidators: true // ✅ prevents bad data
      }
    );

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // ✅ clinicId is now SAFE
    if (clinicId) {
      await clinicSchema.findByIdAndUpdate(
        clinicId,
        { $addToSet: { doctors: doctorId } }
      );
    }

    res.status(200).json({
      message: "Profile updated successfully",
      doctor
    });

  } catch (err) {
    console.error("Doctor profile update error:", err);
    res.status(500).json({
      error: err.message || "Internal Server Error"
    });
  }
});


// User SignUp
app.post('/user_signUp', async (req, res) => {

  try {
    const { name, email, password } = req.body;
    let user = await userSchema.findOne({ email });
    let doctor = await doctorSchema.findOne({ email });
    let clinic = await clinicSchema.findOne({ email });

    if (user || doctor || clinic) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    user = new userSchema({ name, email, password });
    await user.save();
    res.json({ message: 'Signed up successfully', success: true });
  } catch (err) {

    res.status(400).json({ error: err });
  }
});

// Clinic SignUp
app.post('/clinic_signUp', async (req, res) => {

  try {
    const { name, email, password } = req.body;
    let user = await userSchema.findOne({ email });
    let doctor = await doctorSchema.findOne({ email });
    let clinic = await clinicSchema.findOne({ email });
    if (clinic || doctor || user) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    clinic = new clinicSchema({ name, email, password });
    await clinic.save();
    res.json({ message: 'Clinic signed up successfully', success: true });
  } catch (err) {

    res.status(400).json({ error: err });
  }
});

// Clinic Profile Update
app.put('/clinic_update_profile', async (req, res) => {
  try {
    const clinicId = req.body.id;
    const {
      name,
      title,
      mobile,
      addressLine,
      city,
      state,
      pinCode,
      description,
      image,
      showContact,
      clinicType,
      doctors,
      imageDeleteUrl,


    } = req.body;

    const clinic = await clinicSchema.findByIdAndUpdate(clinicId, {
      $set: {
        name,
        title,
        mobile,
        addressLine,
        city,
        state,
        pinCode,
        description,
        image,
        showContact,
        clinicType,
        imageDeleteUrl,

      },
    }, { new: true });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic/Hospital not found' });
    }

    // 🧠 Step 2: If doctors array is provided, add them to clinic.doctors (no duplicates)
    if (doctors && doctors.length > 0) {
      // Ensure it's always an array
      const doctorArray = Array.isArray(doctors) ? doctors : [doctors];

      await clinicSchema.findByIdAndUpdate(
        clinicId,
        {
          $addToSet: { doctors: { $each: doctorArray } }, // ✅ add multiple without duplicates
        },
        { new: true }
      );
    }

    // 🧠 Step 3: Return updated clinic profile
    const updatedClinic = await clinicSchema.findById(clinicId);

    res.json({ message: 'Profile updated successfully', clinic: updatedClinic });
  } catch (err) {

    res.status(500).json({ error: 'Internal Server Error' });
  }

});


// Add doctor Api(Adding Doctor through User/Admin)
app.post('/add_doctor', async (req, res) => {



  const { name, mobile, specialization, education, experience, description, ownerEmail, addedBy, clinic, fees } = req.body;

  try {
    const doctor = await doctorSchema.create({
      name,
      mobile,
      specialization,
      education,
      experience,
      description,
      addedBy,
      ownerEmail,
      clinic,
      fees

    });

    res.status(201).json({ message: "Doctor Added Successfully", doctor });


  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log(error)
  }


})

//Adding Clinic Through User/Admin
app.post('/add_clinic', async (req, res) => {

  try {
    const { name, title, email, addressLine, city, state, pinCode, addedBy, ownerEmail, description, } = req.body

    const clinic = await clinicSchema.create({
      name, title, email, addressLine, city, state, pinCode, addedBy, ownerEmail, description,
    })
    res.status(201).json({ message: "Clinic Added Successfully", clinic });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log(error)
  }


})

// Log in API
app.post("/logIn", async (req, res) => {
  try {
    const { email, password } = req.body;
    let doctor = await doctorSchema.findOne({ email });
    let user = await userSchema.findOne({ email });
    let clinic = await clinicSchema.findOne({ email });

    if (doctor && doctor.password === password) {
      return res.json({ message: 'Logged in successfully', data: doctor, type: 'doctor' });
    } else if (user && user.password === password) {
      return res.json({ message: 'Logged in successfully', data: user, type: 'user' });
    } else if (clinic && clinic.password === password) {
      return res.json({ message: 'Logged in successfully', data: clinic, type: 'clinic/Hospital' });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {

    res.status(500).json({ error: 'Error logging in' });
  }


})
//Get All doctors API
app.get("/get_doctors", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = 20;
    const skip = (page - 1) * limit;

    // Fetch next 20 doctors
    const doctors = await doctorSchema.find({})
      .skip(skip)
      .limit(limit);

    const total = await doctorSchema.countDocuments();

    res.json({
      message: `Fetched ${doctors.length} doctors`,
      totalDoctors: total,
      currentPage: page,
      hasMore: skip + doctors.length < total,
      data: doctors
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching doctors' });
  }
});

// Get paginated clinics (20 per page)
app.get("/clinics", async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 20;
    let skip = (page - 1) * limit;

    const totalClinics = await clinicSchema.countDocuments();

    const clinics = await clinicSchema
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // latest first

    res.json({
      success: true,
      message: `Fetched ${clinics.length} clinics`,
      page,
      totalClinics,
      hasMore: skip + clinics.length < totalClinics,
      data: clinics
    });
  } catch (err) {
    console.error("Error fetching clinics:", err);
    res.status(500).json({ success: false, error: "Error fetching clinics" });
  }
});



//Get Doctor(Indiviadual) API

app.post("/find_doctor", async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: "userId is required", success: false });
    }

    // ✅ Find doctor by _id instead of email
    const doctorDetails = await doctorSchema.findById(doctorId);

    if (!doctorDetails) {
      return res.status(404).json({ message: "Doctor not found", success: false });
    }

    res.status(200).json({ user: doctorDetails, success: true });
  } catch (error) {
    console.error("Error finding doctor:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

//Get Clinic/Hospital(Indiviadual) API
app.post("/find_clinic", async (req, res) => {

  try {
    let clinicId = req.body.clinicId
    let clinicDetails = await clinicSchema.findById(clinicId);

    if (!clinicDetails) {
      res.send({ message: "Clinic not found", success: false })
    } else {
      res.json({ user: clinicDetails, success: true });
    }


  } catch (error) {
    res.return({ message: error })
  }

})
// Find User Using userId for (Profile Screen ..)
app.post("/find_user", async (req, res) => {

  try {
    let userId = req.body.userId
    let userDetails = await userSchema.findById(userId);

    if (!userDetails) {
      res.send({ message: "user not found", success: false })
    } else {
      res.json({ user: userDetails, success: true });
    }


  } catch (error) {
    res.return({ message: error })
  }

})

// Find user using user email for (DoctorDetailsScreen and ClinicDetailsScreen to show credit)
app.get("/find_user_details/:userEmail", async (req, res) => {
  try {
    const userEmail = req.params.userEmail;

    if (!userEmail) {
      return res.status(400).json({
        status: "error",
        message: "User email is required"
      });
    }

    // 🔍 Find user inside userSchema only
    const user = await userSchema.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    // 🎯 Return user details
    return res.status(200).json({
      status: "success",
      message: "User details fetched successfully",
      user
    });

  } catch (error) {
    console.error("Error fetching user details:", error);

    return res.status(500).json({
      status: "error",
      message: "Server error while fetching user details",
      error: error.message
    });
  }
});



//Get Doctor those are added by user 
app.get('/user_added_doctors/:email', async (req, res) => {
  try {

    let { email } = req.params
    let doctors = await doctorSchema.find({ ownerEmail: email })
    if (!doctors) {
      res.json({ message: "No Doctor Found" })
    } else {
      res.json({ doctors: doctors })
    }

  } catch (error) {
    res.json({ error: error })

  }




})


//Get Clinics those are added by user 
app.get('/user_added_clinics/:email', async (req, res) => {

  try {

    let { email } = req.params
    let doctors = await clinicSchema.find({ ownerEmail: email })
    if (!doctors) {
      res.json({ message: "No Doctor Found" })
    } else {
      res.json({ doctors: doctors })
    }

  } catch (error) {
    res.json({ error: error })

  }

})

//delete doctors added by user

app.delete("/delete_doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;


    const deletedDoctor = await doctorSchema.findByIdAndDelete(doctorId);

    if (!deletedDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting Doctor:", error);
    res.status(500).json({ error: "Server error" });
  }


})

//delete clinic added by user
app.delete("/delete_clinic/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;


    const deletedClinic = await clinicSchema.findByIdAndDelete(clinicId);

    if (!deletedClinic) {
      return res.status(404).json({ error: "Clinic not found" });
    }

    res.status(200).json({ message: "Clinic deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting Doctor:", error);
    res.status(500).json({ error: "Server error" });
  }


})

app.post("/add_address", async (req, res) => {
  try {

    const newAddresses = req.body.addresses;



    // Insert all addresses into the collection
    const result = await addressesSchema.insertMany(newAddresses);

    res.status(201).json({ message: "Addresses added successfully", data: result });



  } catch (error) {
    res.json({ error: error })

  }

})

app.get('/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const addresses = await addressesSchema.find(
      { doctorId: id },

    );

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ error: "No Addresses found with this DoctorId" });
    }


    res.status(200).json({ addresses });
  } catch (error) {

    res.status(500).json({ error: "Server error" });
  }
})

app.delete('/delete_address/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;


    const deletedAddress = await addressesSchema.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.status(200).json({ message: "Address deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/add_clinicDoctor', async (req, res) => {
  let doctors = req.body.doctors;

  try {

    // Insert all doctors into the collection
    const result = await clinicDoctorSchema.insertMany(doctors);
    res.status(201).json({ message: "Doctors  successfully added", data: result });

  } catch (error) {
    res.send(error)
  }


})
app.get('/get_clinicDoctors/:email', async (req, res) => {

  const { email } = req.params;
  try {

    // Insert all doctors into the collection
    const doctors = await clinicDoctorSchema.find(
      { clinicEmail: email },
    );

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ error: "No doctor found with that email" });
    }

    res.status(200).json({ doctors });

  } catch (error) {
    res.send(error)
  }


})

app.delete('/delete_clinicDoctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;


    const deletedDoctor = await clinicDoctorSchema.findByIdAndDelete(doctorId);

    if (!deletedDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// API for posting comment for Doctor
app.post('/add_doctor_comment', async (req, res) => {

  const { comment, userId, doctorId } = req.body
  try {


    let result = await doctorCommentsSchema.create({ comment, userId, doctorId })
    res.status(201).json({ message: "Comment Added Successfully", result });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log(error)
  }
})

app.get("/get_doctor_comments/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    let skip = parseInt(req.query.skip) || 0;
    let limit = parseInt(req.query.limit) || 10;

    // Count total comments for that doctor
    const totalComments = await doctorCommentsSchema.countDocuments({ doctorId });

    // Fetch the next batch of comments (latest first)
    const comments = await doctorCommentsSchema.find({ doctorId })
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate hasMore
    const newSkip = skip + comments.length;
    const hasMore = newSkip < totalComments;

    return res.status(200).json({
      success: true,
      comments,
      skip: newSkip,
      limit,
      hasMore,
      totalComments,
    });
  } catch (error) {
    console.error("Error fetching doctor comments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching comments",
      error: error.message,
    });
  }
})

// Get details of commenter for Doctor
app.get('/get_doctor_commenter_details/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find the commenter in User schema
    let commenter = await userSchema.findById(id).select("name image email image");
    if (commenter) {
      return res.status(200).json({
        success: true,
        type: "user",
        data: commenter,
      });
    }

    // Try to find the commenter in Doctor schema
    commenter = await doctorSchema.findById(id).select("name image email image");
    if (commenter) {
      return res.status(200).json({
        success: true,
        type: "doctor",
        data: commenter,
      });
    }

    // Try to find the commenter in Clinic schema
    commenter = await clinicSchema.findById(id).select("name image email image");
    if (commenter) {
      return res.status(200).json({
        success: true,
        type: "clinic",
        data: commenter,
      });
    }

    // If not found in any schema
    return res.status(404).json({
      success: false,
      message: "Commenter not found in any collection",
    });
  } catch (error) {
    console.error("Error fetching commenter:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching commenter details",
      error: error.message,
    });
  }
})

app.post("/rate_doctor", async (req, res) => {
  try {
    const { doctorId, userId, rating } = req.body;

    if (!doctorId || !userId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "doctorId, userId, and rating are required",
      });
    }

    const doctor = await doctorSchema.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // ✅ Check if already rated
    const userIndex = doctor.raters.indexOf(userId);

    if (userIndex !== -1) {
      // User has already rated → update the rating
      doctor.rating[userIndex] = Number(rating);
    } else {
      // New rating
      doctor.rating.push(Number(rating));
      doctor.raters.push(userId);
    }

    // ✅ Update derived fields
    const total = doctor.rating.reduce((sum, r) => sum + r, 0);
    doctor.totalRatings = doctor.rating.length;
    doctor.avgRating = Number((total / doctor.totalRatings).toFixed(1));

    await doctor.save();

    res.status(200).json({
      success: true,
      message: userIndex !== -1 ? "Rating updated successfully" : "Rating added successfully",
      avgRating: doctor.avgRating,
      totalRatings: doctor.totalRatings,
    });
  } catch (error) {
    console.error("Error rating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rating doctor",
      error: error.message,
    });
  }
});


// API for posting comment for Clinic
app.post('/add_clinic_comment', async (req, res) => {

  const { comment, userId, clinicId } = req.body
  try {


    let result = await clinicCommentsSchema.create({ comment, userId, clinicId })
    res.status(201).json({ message: "Comment Added Successfully", result });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log(error)
  }
})
//  Get all the comments of linic in chunks
app.get("/get_clinic_comments/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    let skip = parseInt(req.query.skip) || 0;
    let limit = parseInt(req.query.limit) || 10;

    // Count total comments for that Clinic
    const totalComments = await clinicCommentsSchema.countDocuments({ clinicId });

    // Fetch the next batch of comments (latest first)
    const comments = await clinicCommentsSchema.find({ clinicId })
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate hasMore
    const newSkip = skip + comments.length;
    const hasMore = newSkip < totalComments;

    return res.status(200).json({
      success: true,
      comments,
      skip: newSkip,
      limit,
      hasMore,
      totalComments,
    });
  } catch (error) {
    console.error("Error fetching clinic comments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching comments",
      error: error.message,
    });
  }
})

// Get details of commenter for clinic
app.get('/get_clinic_commenter_details/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find the commenter in User schema
    let commenter = await userSchema.findById(id).select("name image email image");
    if (commenter) {
      return res.status(200).json({
        success: true,
        type: "user",
        data: commenter,
      });
    }

    // Try to find the commenter in Doctor schema
    commenter = await doctorSchema.findById(id).select("name image email image");
    if (commenter) {
      return res.status(200).json({
        success: true,
        type: "doctor",
        data: commenter,
      });
    }

    // Try to find the commenter in Clinic schema
    commenter = await clinicSchema.findById(id).select("name image email image");
    if (commenter) {
      return res.status(200).json({
        success: true,
        type: "clinic",
        data: commenter,
      });
    }

    // If not found in any schema
    return res.status(404).json({
      success: false,
      message: "Commenter not found in any collection",
    });
  } catch (error) {
    console.error("Error fetching commenter:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching commenter details",
      error: error.message,
    });
  }
})

//   Rate Clinic
app.post("/rate_clinic", async (req, res) => {
  try {
    const { clinicId, userId, rating } = req.body;

    if (!clinicId || !userId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "clinicId, userId, and rating are required",
      });
    }

    const clinic = await clinicSchema.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // ✅ Check if already rated
    const userIndex = clinic.raters.indexOf(userId);

    if (userIndex !== -1) {
      // User has already rated → update the rating
      clinic.rating[userIndex] = Number(rating);
    } else {
      // New rating
      clinic.rating.push(Number(rating));
      clinic.raters.push(userId);
    }

    // ✅ Update derived fields
    const total = clinic.rating.reduce((sum, r) => sum + r, 0);
    clinic.totalRatings = clinic.rating.length;
    clinic.avgRating = Number((total / clinic.totalRatings).toFixed(1));

    await clinic.save();

    res.status(200).json({
      success: true,
      message: userIndex !== -1 ? "Rating updated successfully" : "Rating added successfully",
      avgRating: clinic.avgRating,
      totalRatings: clinic.totalRatings,
    });
  } catch (error) {
    console.error("Error rating clinic:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rating clinic",
      error: error.message,
    });
  }
});

// Search Doctor API
app.get("/search_doctor", async (req, res) => {
  try {
    const {
      query = "",
      specialization,
      education,
      description,
      location, // 🔹 can match addressLine, city, or state
      pinCode,
      rating,
      skip = 0,
      limit = 10,
    } = req.query;

    let doctorIdsFromAddress = null;

    // STEP 1️⃣: Handle address-based filtering
    if (location || pinCode) {
      const addressQuery = {};

      // Flexible matching in addressLine, city, state
      if (location) {
        addressQuery.$or = [
          { addressLine: { $regex: location, $options: "i" } },
          { city: { $regex: location, $options: "i" } },
          { state: { $regex: location, $options: "i" } },
        ];
      }

      if (pinCode) {
        addressQuery.pinCode = parseInt(pinCode);
      }

      const doctorAddresses = await addressesSchema.find(addressQuery, "doctorId");
      doctorIdsFromAddress = doctorAddresses.map((addr) => addr.doctorId);
    }

    // STEP 2️⃣: Build Doctor Query
    const doctorQuery = {
      userType: "Doctor",
      $and: [],
    };

    // Search by name / specialization / education / description
    if (query) {
      doctorQuery.$and.push({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { specialization: { $regex: query, $options: "i" } },
          { education: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      });
    }

    // 🔹 If description filter is given separately (and not covered by query)
    if (description && !query) {
      doctorQuery.$and.push({
        description: { $regex: description, $options: "i" },
      });
    }

    if (specialization)
      doctorQuery.$and.push({
        specialization: { $regex: specialization, $options: "i" },
      });

    if (education)
      doctorQuery.$and.push({
        education: { $regex: education, $options: "i" },
      });


    // STEP 3️⃣: Apply address-based doctor filtering
    if (doctorIdsFromAddress && doctorIdsFromAddress.length > 0) {
      doctorQuery.$and.push({ _id: { $in: doctorIdsFromAddress } });
    } else if (doctorIdsFromAddress && doctorIdsFromAddress.length === 0) {
      // No doctors match address filter
      return res.status(200).json({ success: true, total: 0, results: [] });
    }

    // STEP 4️⃣: Optional rating filter (example: only doctors with any rating)
    if (rating) {
      doctorQuery.$and.push({
        rating: { $exists: true, $not: { $size: 0 } },
      });
    }

    if (doctorQuery.$and.length === 0) delete doctorQuery.$and;

    // STEP 5️⃣: Execute query
    const doctors = await doctorSchema.find(doctorQuery)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await doctorSchema.countDocuments(doctorQuery);

    res.status(200).json({
      success: true,
      total,
      results: doctors,
    });
  } catch (err) {
    console.error("Error searching doctors:", err);
    res.status(500).json({
      success: false,
      message: "Server error while searching doctors",
    });
  }
})

// Search Clinic API

app.get("/search_clinic", async (req, res) => {
  try {
    const {
      query = "",      // keyword for name/description search
      location,        // can match addressLine, city, state
      pinCode,
      skip = 0,
      limit = 10,
    } = req.query;

    // STEP 1️⃣: Build Clinic Query
    const clinicQuery = {
      userType: "Clinic",  // only clinics
      $and: [],
    };

    // 🔹 Search by name or description (query keyword)
    if (query) {
      clinicQuery.$and.push({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      });
    }

    // 🔹 Filter by address fields
    if (location || pinCode) {
      const addressFilter = [];

      if (location) {
        addressFilter.push(
          { addressLine: { $regex: location, $options: "i" } },
          { city: { $regex: location, $options: "i" } },
          { state: { $regex: location, $options: "i" } }
        );
      }

      if (pinCode) {
        addressFilter.push({ pinCode: parseInt(pinCode) });
      }

      if (addressFilter.length > 0) {
        clinicQuery.$and.push({ $or: addressFilter });
      }
    }

    // Remove empty $and
    if (clinicQuery.$and.length === 0) delete clinicQuery.$and;

    // STEP 2️⃣: Execute query
    const clinics = await clinicSchema
      .find(clinicQuery)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await clinicSchema.countDocuments(clinicQuery);

    // STEP 3️⃣: Send response
    res.status(200).json({
      success: true,
      total,
      results: clinics,
    });

  } catch (err) {
    console.error("Error searching clinics:", err);
    res.status(500).json({
      success: false,
      message: "Server error while searching clinics",
    });
  }
});

// delete comment API
app.delete("/delete_comment/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;

    // Try deleting from doctor comments first
    const deletedDoctorComment = await doctorCommentsSchema.findByIdAndDelete(commentId);
    if (deletedDoctorComment) {
      return res.status(200).json({
        success: true,
        message: "Doctor comment deleted successfully",
        deletedFrom: "doctor",
      });
    }

    // If not found, try deleting from clinic comments
    const deletedClinicComment = await clinicCommentsSchema.findByIdAndDelete(commentId);
    if (deletedClinicComment) {
      return res.status(200).json({
        success: true,
        message: "Clinic comment deleted successfully",
        deletedFrom: "clinic",
      });
    }

    // If not found in either schema
    return res.status(404).json({
      success: false,
      message: "Comment not found bro",
    });

  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post("/add_doctor_to_clinicDoctors_list", async (req, res) => {
  try {
    const { clinicId, doctorId } = req.body;

    // 🛑 Validate input
    if (!clinicId || !doctorId) {
      return res.status(400).json({ message: "clinicId and doctorId are required", success: false });
    }

    // 🧠 Find the clinic
    const clinic = await clinicSchema.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found", success: false });
    }

    // ⚡ Prevent duplicate doctor entries
    if (clinic.doctors.includes(doctorId)) {
      return res.status(400).json({ message: "Doctor already added to this clinic", success: false });
    }

    // ➕ Add doctor to the clinic’s doctors array
    clinic.doctors.push(doctorId);

    // 💾 Save the updated clinic
    await clinic.save();

    res.status(200).json({
      success: true,
      message: "Doctor added successfully to the clinic",
      clinic,
    });
  } catch (error) {
    console.error("Error adding doctor to clinic:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
})

// Find owner of the Doctors(If added by user) for show credits
app.get("/get_contributor/:ownerEmail", async (req, res) => {
  try {
    const { ownerEmail } = req.params;

    if (!ownerEmail) {
      return res.status(400).json({
        success: false,
        message: "Owner email is required",
      });
    }



    // 2️⃣ Search in User Schema
    const userOwner = await userSchema.findOne({ email: ownerEmail });

    if (userOwner) {
      return res.status(200).json({
        success: true,
        from: "user",
        data: userOwner,
      });
    }


    // 1️⃣ Search in Clinic Schema
    const clinicOwner = await clinicSchema.findOne({ email: ownerEmail });

    if (clinicOwner) {
      return res.status(200).json({
        success: true,
        from: "clinic",
        data: clinicOwner,
      });
    }

    // 3️⃣ Search in Doctor Schema
    const doctorOwner = await doctorSchema.findOne({ email: ownerEmail });

    if (doctorOwner) {
      return res.status(200).json({
        success: true,
        from: "doctor",
        data: doctorOwner,
      });
    }

    // ❌ No match found anywhere
    return res.status(404).json({
      success: false,
      message: "No contributor found with this email",
    });
  } catch (error) {
    console.log("Error finding contributor:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

  // API for update user image
app.post("/update_user_image", async (req, res) => {
  try {
    const { userId, imageUrl, imageDeleteUrl } = req.body;

    if (!userId || !imageUrl) {
      return res.send({
        message: "userId and imageUrl are required",
        success: false
      });
    }

    // Update user image
    const updatedUser = await userSchema.findByIdAndUpdate(
      userId,
      { image: imageUrl, imageDeleteUrl: imageDeleteUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.send({
        message: "User not found",
        success: false
      });
    }

    res.send({
      message: "Image updated successfully",
      user: updatedUser,
      success: true
    });

  } catch (error) {
    res.send({
      message: error.message,
      success: false
    });
  }
});

//For ImageKit Authorization token
app.get("/imagekit_auth", function (req, res) {
  var authenticationParameters = imagekit.getAuthenticationParameters();
  res.json(authenticationParameters);
});

app.patch("/update_user_credit", async (req, res) => {
  try {
    const { userId, credit } = req.body;
    const updatedUser = await userSchema.findByIdAndUpdate(userId, { credit }, { new: true });
    res.status(200).json({ message: "Credit updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});