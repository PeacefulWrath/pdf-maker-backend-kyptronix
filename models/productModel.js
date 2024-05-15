const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryModel"
    },
    real_price:{
      type: Number,
    },
    discounted_price:{
      type: Number,
    },
    star:{
      type: String,
    }
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("ProductModel", productSchema);

module.exports = ProductModel;
