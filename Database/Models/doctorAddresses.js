const mongoose = require('mongoose');

const doctorAddressesSchema= new mongoose.Schema({
doctorEmail:{type:String},
doctorId:{type:String}, //If Doctor added by user or Admin than its not necessary that Doctor Email exist thats why doctorId needed to track
addressLine:{type:String},
city:{type:String},
state:{type:String},
pinCode:{type:Number},
availability:{type:Array},
addedBy:{type:String}, 
ownerEmail:{type:String}, // If Doctor Address Added by any user or Admin its necesssary to track 
clinicId:{type:String},
clinicName:{type:String}
})

module.exports=mongoose.model("Addresses",doctorAddressesSchema)