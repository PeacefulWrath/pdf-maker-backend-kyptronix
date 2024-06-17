const express = require("express");
const {
    getToken, verifyToken
} = require("../controllers/userController");
const { createOrders,fetchOrders, deleteOrders } = require("../controllers/orderController");


const router = express.Router();


router.post("/",getToken,verifyToken,createOrders);
router.get("/", getToken, verifyToken,fetchOrders);
router.delete("/", getToken, verifyToken,deleteOrders);

module.exports = router;
