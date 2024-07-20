require("dotenv").config();
const mongoose = require('mongoose')
const express = require('express');
const app = express()
const ejsMate = require('ejs-mate')
const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});


const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));

const path = require('path');
app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname, './views'));


const dbUrl=process.env.DB_URL
//'mongodb://127.0.0.1:27017/bank'
mongoose.connect(dbUrl)
    .then(() => {
        console.log('mongoose connected');
    })
    .catch((e) => {
        console.log(e);
    });

    const CustomerDetails = require('./models/customer.js');
    const TransactionDetails = require('./models/transaction.js');
    
    app.get('/heistbank', (req, res) => {
        res.render('home')
    })
    
    app.get('/heistbank/oldTransactions', async (req, res) => {
        const TransactionData = await TransactionDetails.find({})
        console.log(TransactionData)
        res.render('history', { TransactionData })
    })
    
    app.get('/heistbank/customers', async (req, res) => {
        const CustomerData = await CustomerDetails.find({})
        res.render('customers', { CustomerData })
    })
    
    app.get('/heistbank/customers/:id', async (req, res) => {
        const oneCustomerData = await CustomerDetails.findById(req.params.id)
        console.log(oneCustomerData)
        res.render('show', { oneCustomerData})
    })
    
    app.get('/heistbank/customers/:id/transfer', async (req, res) => {
        const oneCustomerData = await CustomerDetails.findById(req.params.id)
        const otherCustomerData = await CustomerDetails.find({ _id: { $ne: oneCustomerData._id } });
        res.render('transfer', { oneCustomerData, otherCustomerData })
    })

    app.post('/heistbank/customers/:id', async (req, res) => {
        const { customer, amount } = req.body;
    
        await CustomerDetails.updateOne(
            { _id: req.params.id },
            { $inc: { amountAvailable: -amount } }
        );
        await CustomerDetails.updateOne(
            { _id: customer },
            { $inc: { amountAvailable: +amount } }
        );
    
    
        const senderCustomer = await CustomerDetails.findById(req.params.id);
        const receiverCustomer = await CustomerDetails.findById(customer);
    
        const transactionDetails = new TransactionDetails({
            sender: senderCustomer.name,
            receiver: receiverCustomer.name,
            amount: amount
        });
    
        await transactionDetails.save();
    
    
        res.redirect('/heistbank/customers')
    })

app.post('/createOrder', async(req,res)=>{
    try {
        const amount = req.body.amount*100
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }

        razorpayInstance.orders.create(options, 
            (err, order)=>{
                if(!err){
                    res.status(200).send({
                        success:true,
                        msg:'Order Created',
                        order_id:order.id,
                        amount:amount,
                        key_id:RAZORPAY_ID_KEY,
                        product_name:req.body.name,
                        description:req.body.description,
                        contact:"8567345632",
                        name: "kake name",
                        email: "fake@gmail.com"
                    });
                }
                else{
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            }
        );

    } catch (error) {
        console.log(error.message);
    }
});


app.listen(3000, function(){
    console.log('Server is running');
});