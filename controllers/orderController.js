const OrderModel = require("../models/orderModel");

const dotenv = require("dotenv");

var CryptoJS = require("crypto-js");


exports.createOrders = async (req, res) => {
  try {
    let orderModel = new OrderModel();
    orderModel.order_id = req.body.order_id
    orderModel.product = req.body.product
    orderModel.user = req.body.user
    orderModel.delivered = req.body.delivered
    

    const insertedData = await orderModel.save()
    if (insertedData) {
      return res.send({success: "yes",message:"order created",insertedData})
    } else {
      throw new Error("order not created")
    }

  } catch (error) {
    return res.status(400).send({success: "no", message: error.message });
  }
};

exports.fetchOrders = async (req, res) => {
    try {
      let allOrderData = await OrderModel.find({}).populate("user").populate('product')
      
      if (allOrderData) {
        return res.send({ success: "yes",
          message: "all order data",allOrderData})
      } else {
        throw new Error("order not fetched")
      }
  
  
    } catch (error) {
      return res.status(400).send({ success:"no",message: error.message });
    }
};

exports.deleteOrders = async (req, res) => {
  try {
    const orderId = req.body.order_id;

    const deletedData = await OrderModel.findOneAndDelete({
      _id: { $eq: orderId },
    });
    if (deletedData) {
      return res.status(201).send({ success: "yes", deletedData });
    } else {
      throw new Error("order not deleted");
    }
  } catch (error) {
    return res.status(400).send({ success: "no", message: error.message });
  }
};