const { string } = require("joi");
const mongoose = require("mongoose");

const productCategory = new mongoose.Schema({
     title:{
        type:String
     },
     id:{
      type:String
     },
     discription:{
      type:String
     }

     
})

const category = mongoose.model("productCategory", productCategory);

module.exports = category;
