const mongoose = require('mongoose');

const clinicCommentsSchema=new mongoose.Schema({
userId:{type:String,require:true},
doctorId:{type:String,require:true},
comment:{type:String}


}, { timestamps: true })

module.exports=mongoose.model("ClinicComments",clinicCommentsSchema)