const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const doctorSchema = require('./Database/Models/Doctors.js')
const clinicSchema = require('./Database/Models/Clinics.js')
const userSchema = require('./Database/Models/Users.js')
const addressesSchema = require('./Database/Models/doctorAddresses.js')
const clinicDoctorSchema = require('./Database/Models/ClinicDoctors.js')


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

    // controllers/doctors.js

    try {
        const doctorId = req.body.id;
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
        } = req.body;

        const doctor = await doctorSchema.findByIdAndUpdate(doctorId, {
            $set: {
                name,
                title,
                email,
                mobile,
                description,
                experience,
                education,
                specialization,
                image,
                showContact,
            },
        }, { new: true });

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({ message: 'Profile updated successfully', doctor });
    } catch (err) {

        res.status(500).json({ error: 'Internal Server Error' });
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

            },
        }, { new: true });

        if (!clinic) {
            return res.status(404).json({ error: 'Clinic/Hospital not found' });
        }

        res.json({ message: 'Profile updated successfully', clinic });
    } catch (err) {

        res.status(500).json({ error: 'Internal Server Error' });
    }

});


// Add doctor Api(Adding Doctor through User/Admin)
app.post('/add_doctor', async (req, res) => {



    const { name, mobile, specialization, education, experience, description, ownerEmail, addedBy } = req.body;

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
        const { name, title, email, addressLine, city, state, pinCode, addedBy, ownerEmail, description } = req.body

        const clinic = await clinicSchema.create({
            name, title, email, addressLine, city, state, pinCode, addedBy, ownerEmail, description
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
app.get("/", async (req, res) => {
    try {
        const totalDoctors = await doctorSchema.countDocuments();
        const limit = totalDoctors < 20 ? totalDoctors : 20;
        const doctors = await doctorSchema.aggregate([{ $sample: { size: limit } }]);
        res.json({ message: `Fetched ${doctors.length} random doctors`, data: doctors });
    } catch (err) {

        res.status(500).json({ error: 'Error fetching random doctors' });
    }
})

//Get All clinics API
app.get("/clinics", async (req, res) => {
    try {
        const totalClinics = await clinicSchema.countDocuments();
        const limit = totalClinics < 20 ? totalClinics : 20;
        const clinics = await clinicSchema.aggregate([{ $sample: { size: limit } }]);
        res.json({ message: `Fetched ${clinics.length} random clinics`, data: clinics });
    } catch (err) {

        res.status(500).json({ error: 'Error fetching random clinics' });
    }
})

//Get Doctor(Indiviadual) API

app.post("/find_doctor", async (req, res) => {

    try {
        let email = req.body.email
        let doctorDetails = await doctorSchema.findOne({ email });

        if (!doctorDetails) {
            res.send({ message: "Doctor not found", success: false })
        } else {
            res.json({ user: doctorDetails, success: true });
        }


    } catch (error) {
        res.return({ message: error })
    }

})

app.post("/find_clinic", async (req, res) => {

    try {
        let email = req.body.email
        let clinicDetails = await clinicSchema.findOne({ email });

        if (!clinicDetails) {
            res.send({ message: "Clinic not found", success: false })
        } else {
            res.json({ user: clinicDetails, success: true });
        }


    } catch (error) {
        res.return({ message: error })
    }

})

app.post("/find_user", async (req, res) => {

    try {
        let email = req.body.email
        let userDetails = await userSchema.findOne({ email });

        if (!userDetails) {
            res.send({ message: "user not found", success: false })
        } else {
            res.json({ user: userDetails, success: true });
        }


    } catch (error) {
        res.return({ message: error })
    }

})
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







app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});