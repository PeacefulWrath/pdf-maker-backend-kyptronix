const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_id:{
          type:String,
          unique:true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductModel",
    },
    delivered: {
      type: String,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("OrderModel", orderSchema);

module.exports = OrderModel;
