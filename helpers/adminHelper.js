const { response } = require("../app");
const { editProduct } = require("../controllers/adminController");
const { db } = require("../models/productSchema");
const productData = require("../models/productSchema");
const dbProduct = require("../models/productSchema");
const admindata = require("../models/adminShema");
const bcrypt = require("bcrypt");
const dbUser = require("../models/userSchema");

module.exports = {
  adminId: (data, next) => {
    try {
      return new Promise(async (resolve, reject) => {
        const admin = await admindata.findOne({ Email: data.Email });
        // console.log(admin);

        if (admin) {
          bcrypt.compare(data.Password, admin.Password).then((status) => {
            if (status) {
              console.log("login success");
              // response.status=true
              // console.log(response.status);
              resolve(true);
            } else {
              console.log("login F");
              resolve(false);
            }
          });
        } else {
          console.log("Loooo");
          resolve(false);
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // adminId : (data)=>{
  //     return new Promise (async(resolve,reject)=>{
  //         const admin = await admindata.findOne({Email:data.Email})
  //         if(!admin){
  //             data.Password=await bcrypt.hash(data.Password,10)
  //             await admindata.create(data).then((data) => {
  //                 //console.log(data);
  //            resolve(data)
  //           })}else{
  //         reject(Error)
  //           }
  //     })
  // },

  userBlock: (userID, next) => {
    try {
      return new Promise((resolve, reject) => {
        dbUser
          .updateOne({ _id: userID }, { $set: { is_active: false } })
          .then((result) => {
            resolve(result);
          });
      });
    } catch (err) {
      next(err);
    }
  },
  userUnBlock: (userID, next) => {
    try {
      return new Promise((resolve, reject) => {
        dbUser
          .updateOne({ _id: userID }, { $set: { is_active: true } })
          .then((result) => {
            resolve(result);
          });
      });
    } catch (err) {
      next(err);
    }
  },

  getProducts: async (next) => {
    try {
      return new Promise((resolve, reject) => {
        dbProduct
          .find()
          .populate("category").sort({createdAt:-1})
          .then((result) => {
            resolve(result);
          });
      });
    } catch (err) {
      next(err);
    }
  },
};
