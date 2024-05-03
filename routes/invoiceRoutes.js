const express = require("express");
const {
    saveInvoices,
    updateInvoices,
    fetchInvoices
 
} = require("../controllers/invoiceController");


const router = express.Router();




router.post("/",    saveInvoices);
router.put("/",    updateInvoices);
router.get("/",    fetchInvoices);
module.exports = router;
