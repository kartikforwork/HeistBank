const mongoose = require('mongoose');
const customers = require('./customers');
const CustomerDetails = require('../models/customer');
const TransactionDetails = require('../models/transaction');


if((process.env.NODE_ENV!=="production")){
    require('dotenv').config({ path: '../.env' });
}

const dbUrl=process.env.DB_URL
// require('dotenv').config({ path: '../.env' }); // Adjust the path as needed


mongoose.connect(dbUrl)
    .then(() => {
        console.log('mongoose connected');
    })
    .catch((e) => {
        console.log(e);
    });




const seedDB = async () => {
    await CustomerDetails.deleteMany({})
    await TransactionDetails.deleteMany({})
    for (let customerData of customers) {
        const customer = new CustomerDetails({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            amountAvailable: customerData.amountAvailable,
            account:customerData.account,
            img:customerData.img
        });
        console.log(customer)
        await customer.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
