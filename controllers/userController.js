const { response } = require("../app");
const userHelper = require("../helpers/userHelper");
const { message } = require("../models/joiShcema");
const userValidation = require("./joiControllers");
const productHelper = require("../helpers/productHelpers");
const productDB = require("../models/productSchema");
const userDB = require("../models/userSchema");
const cartDB = require("../models/cartShcema");
const Twilio = require("../middleware/otpVerification");
const adressDB = require("../models/adressScema");

//For Register Page
const homeView = async (req, res) => {
  const user = req.session.user;
  res.locals.user = user || null;
  let cartCount = null;
  if (user) {
    // console.log(user);
    cartCount = await userHelper.getCartCount(user._id);
    res.locals.cartCount = cartCount;
  }
  //console.log(cartCount);
  res.render("user/home", { user, cartCount });
};

const signupView = (req, res) => {
  res.render("user/signup", { error: req.flash("userErr") });
};

const loginView = (req, res) => {
  if (!req.session.loggedIn) {
    res.render("user/login", { error: req.flash("userErr") });
  } else {
    res.redirect("/");
  }
};

const userLogin = (req, res) => {
  userHelper.userLogin(req.body).then((response) => {
    //console.log(response);
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;

      res.redirect("/");
    } else {
      req.flash("userErr", "Incorrect username or password ! ");
      res.redirect("/login");
    }
  });
};

const otpSend = (req, res) => {
  res.render("user/otplogin");
};

// const userOtp = async (req, res)=>{
//   //const number = req.session.phone
//  // console.log(data);
//   console.log(req);
//   const sms= await otp.sendSMS(req).then((response)=>{

//     res.redirect("/otplogin")

//   })

// }

const postOTP = async (req, res) => {
  let data = req.session.temp;
  // console.log(data);
  const otp = req.body.otp;
  const number = data.PhoneNumber;
  const getOtp = await Twilio.verifySMS(number, otp).then(
    (verification_check) => {
      //console.log(response);
      if (verification_check.status == "approved") {
        userHelper
          .signinData(data)
          .then((response) => {
            // console.log(response);
            res.redirect("/login");
          })
          .catch((resolve) => {
            // console.log(resolve);
            req.flash("userErr", " Email already used");
            res.redirect("/signup");
          });
      } else {
        res.redirect("/signup");
      }
    }
  );
};

const userSignup = async (req, res) => {
  let validate = await userValidation(req);
  req.session.temp = req.body;
  const number = req.body.PhoneNumber;
  //console.log(number);
  if (validate === true) {
    if (number) {
      const sms = await Twilio.sendSMS(number).then((response) => {
        res.redirect("/otplogin");
      });
    } else {
      res.redirect("/signup");
    }
  } else {
    // console.log(message);
    req.flash("userErr", " User Data not filled");
    res.redirect("/signup");
  }
};

const productView = async (req, res) => {
  const user = await req.session.user;
  let cartCount = null;
  if (user) {
    // console.log(user);
    cartCount = await userHelper.getCartCount(user._id);
    res.locals.cartCount = cartCount;
  }
  productHelper.productsUserSide().then((data) => {
    //console.log(data);
    res.render("user/shope", { data, user, cartCount });
  });
};

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

const viewProfile = async (req, res) => {
  const user = req.session.user;
  const userId = user._id;
  //console.log(userId);
  const address = await adressDB.find({ userId: userId });
  //console.log(address);
  res.render("user/profile", { user, address });
};

const addAdress = (req, res) => {
  res.render("user/adress");
};
const saveAdress = async (req, res) => {
  const user = req.session.user;
  const userId = user._id;
  Object.assign(req.body, { userId: userId });
  const data = req.body;
  const save = await adressDB.create(data);
  res.redirect("/profile");
};

const editAddress = async (req, res) => {
  const user = req.session.user;
  const userId = user._id;
  const Id = req.params.id;
  //console.log(Id);
  const data = await adressDB.findOne({ _id: Id });
  // console.log(data);
  res.render("user/editaddress", { data });
};

const deleteAddress = async (req, res) => {
  //console.log(req.params.id);
  const Id = req.params.id;
  const remove = await adressDB.findByIdAndRemove(Id);
  res.redirect("/profile");
};

const updateAddress = async (req, res) => {
  const data = req.body;
  const ID = req.params.id;
  const update = await adressDB.findOneAndUpdate(
    { _id: ID },
    {
      $set: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        pincode: data.pincode,
        locality: data.locality,
        adress: data.adress,
        city: data.city,
        landmark: data.landmark,
        AlternatePhone: data.AlternatePhone,
        state: data.state,
      },
    }
  );

  //console.log(data);
  //console.log(update);
  res.redirect("/profile");
};

const singleProduct = async (req, res) => {
  const ID = req.params.id;
  const user = req.session.user;
  //console.log(ID);
  const all = await productDB.find({ active: true });
  const product = await productDB.findOne({ _id: ID });
  // console.log(product);
  res.render("user/singleproduct", { product, all, user });
};

const contactView = (req, res) => {
  res.render("user/contact");
};
const aboutView = (req, res) => {
  res.render("user/about");
};
const logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

module.exports = {
  homeView,
  signupView,
  loginView,
  userLogin,
  userSignup,
  aboutView,
  otpSend,
  contactView,
  productView,
  logout,
  postOTP,
  verifyLogin,
  viewProfile,
  addAdress,
  saveAdress,
  editAddress,
  deleteAddress,
  updateAddress,
  singleProduct,
};