const express = require("express");
const {
    saveFaqs,
    fetchFaqs,
    updateFaqs,
    deleteFaqs
} = require("../controllers/faqController");
const { getToken, verifyToken } = require("../controllers/userController");


const router = express.Router();




router.post("/",    saveFaqs);
router.put("/",    updateFaqs);
router.get("/", getToken,verifyToken,fetchFaqs);
router.delete("/",    deleteFaqs);
module.exports = router;
