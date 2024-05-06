const express = require("express");
const {
    saveInvoices,
    updateInvoices,
    fetchInvoices,
    deleteInvoices
 
} = require("../controllers/invoiceController");


const router = express.Router();




router.post("/",    saveInvoices);
router.put("/",    updateInvoices);
router.get("/",    fetchInvoices);
router.delete("/",    deleteInvoices);
module.exports = router;
