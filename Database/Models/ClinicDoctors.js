const mongoose = require('mongoose');

const clinicDoctorSchema=new mongoose.Schema({
    clinicEmail:{type:String},
    name:{type:String},
    education:{type:String},
    specialization:{type:String},    
    description:{type:String}

},{ timestamps: true })

module.exports = mongoose.model('ClinicDoctors', clinicDoctorSchema);