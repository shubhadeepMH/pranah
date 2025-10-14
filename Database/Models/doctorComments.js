const mongoose = require('mongoose');

const doctorCommentsSchema=new mongoose.Schema({
userId:{type:String,require:true},
doctorId:{type:String,require:true},
comment:{type:String}



})

module.exports=mongoose.model("DoctorComments",doctorCommentsSchema)