const mongoose=require('mongoose');

const transactionSchema = new mongoose.Schema({
    sender:String,
    receiver:String,
    amount:String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('transaction', transactionSchema);