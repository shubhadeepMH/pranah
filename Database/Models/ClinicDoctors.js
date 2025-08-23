const mongoose = require('mongoose');

const clinicDoctorSchema=new mongoose.Schema({

    name:{type:String},
    education:{type:String},
    specialization:{type:String},
    



},{ timestamps: true })

module.exports = mongoose.model('ClinicDoctors', clinicDoctorSchema);