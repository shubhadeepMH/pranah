const mongoose = require('mongoose');

const doctorAddressesSchema= new mongoose.Schema({
doctorEmail:{type:String},
addressLine:{type:String},
city:{type:String},
state:{type:String},
pinCode:{type:Number},
availability:{type:Array},
addedBy:{type:String}, 
ownerEmail:{type:String}, // If Doctor Address Added by any user or Admin its necesssary to track 

})

module.exports=mongoose.model("Addresses",doctorAddressesSchema)