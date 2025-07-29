const mongoose = require('mongoose');

const doctorAddressesSchema= new mongoose.Schema({
doctorEmail:{type:String},
addressLine:{type:String},
city:{type:String},
state:{type:String},
pinCode:{type:Number},
availability:{type:Array},

})

module.exports=mongoose.model("Addresses",doctorAddressesSchema)