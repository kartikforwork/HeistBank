const mongoose=require('mongoose');

const customerSchema = new mongoose.Schema({
    name: String,
    account:String,
    email: String,
    phone: String,
    img:String,
    amountAvailable: Number
});

module.exports=mongoose.model('customer', customerSchema);