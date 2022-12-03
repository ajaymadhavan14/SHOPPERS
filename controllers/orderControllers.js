const cartDB = require("../models/cartShcema");
const addressDB = require("../models/adressScema");
const orderDB = require("../models/orderSchema");
const moment = require("moment");
const Razorpay = require("razorpay");
const crypto = require("crypto")
const userDB = require("../models/userSchema")
const checkOutValidation = require("../validation/checkout")

const instance = new Razorpay({
  key_id: "rzp_test_gVjE7EEMOSkshL",
  key_secret: "kTKQzkNSx1rrsehhJgW9511O",
});

module.exports = {
  checkOutPage: async (req, res) => {
    const user = req.session.user;
    const userId = user._id;
    // const product = await cartDB.findOne({ userId: userId })
    const product = await cartDB
      .findOne({ userId: userId })
      .populate("products.productId");

    let address = null;
    const productData = product.products;
   // console.log(product);
    //console.log(productData);

    const addressData = await addressDB.findOne({ userId: userId });
    if (addressData) {
      address = addressData.address;
    }
    //console.log(address);

    res.render("user/checkoutbox", { product, productData, address ,error: req.flash("userErr") ,addressData});
  },

  orderConform : async(req, res) => {
    console.log(req.body);
    let validate = await checkOutValidation(req)
    if(validate==true){
    const user = await req.session.user;
    const userId = await user._id;
    const cartData = await cartDB.findOne({ userId: userId });
    console.log(cartData);
    const price = await cartData.grandtotal;
    const products = await cartData.products;
    //console.log(products);
    const ID = products.productId;
    let status = req.body.payment == "COD" ? "placed" : "pending";
    // console.log(ID);

    Object.assign(
      req.body,
      { userId: userId },
      { price: price },
      { products: products },
      { date: moment().format("MMMM Do YYYY, h:mm:ss a") },
      { status: status }
    );
    const order = await orderDB.create(req.body);
    const newOrderId = order._id
    //console.log(order.id);
    //console.log(newOrderId);
    const remove = await cartDB.findOneAndRemove({ userId: userId });

    if (req.body["payment"] == "COD") {
      res.json({ cod: true ,newOrderId});
    } else {
      const onlinePay = await instance.orders.create({
        amount: price*100,
        currency: "INR",
        receipt: "" + order._id,
        notes: {
          key1: "value3",
          key2: "value2",
        },
      });
     // console.log(onlinePay);
      res.json({ onlinePay });
      
    }
    }else {
     let err = validate
     console.log(err);
     req.flash("userErr", "Incorrect email ! ");
      res.redirect("/checkout")
    }

  },

  viewOreders: async(req, res) => {

    //console.log(req.params.id);

    const orderId = req.params.id
   
    const order = await orderDB.findOne({_id:orderId})
    //console.log(order);
     const user = order.userId
     const userData = await userDB.findOne({_id:user})
     // console.log(userData);
    const addressId = order.addressId
    let product = null
    let adressData = null
    //console.log(addressId);
    if(order){
      const data = await orderDB.findOne({_id:orderId}).populate("products.productId")
       product = data.products
     // console.log(product);
      const address = await addressDB.findOne({userId:user})
      //console.log(address);
       adressData = await address.address.find(
        (el) => el._id.toString() == addressId
      );
      //console.log(adressData);
    }
    

    res.render("user/vieworders",{userData,product,order,adressData});
  },
  verifyPayment: async(req, res) => {
    //console.log(req.body);
    const orderId = req.body.payment['razorpay_order_id']
    const paymentId = req.body.payment['razorpay_payment_id']
    const sign = req.body.payment['razorpay_signature']
    const cartId = req.body.order['receipt']
    
   
   let hmac = crypto.createHmac('sha256','kTKQzkNSx1rrsehhJgW9511O')
    hmac.update(orderId +'|'+ paymentId)
    hmac= hmac.digest('hex')
    if(hmac==sign){
       const update = await orderDB.findOneAndUpdate({_id:cartId},{$set:{
        status:'placed'
       }})
      
      res.json({status:true,})
    }else{
      res.json({status:false})
    }
    
  },

  thankYou: async(req, res) => {
    const orderId = req.params.id
    const order = await orderDB.findOne({_id:orderId})
    res.render("user/thankyou",{order})
  },
};