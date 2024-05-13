const express = require("express");
const {
    saveFaqs,
    fetchFaqs,
    updateFaqs,
    deleteFaqs
} = require("../controllers/faqController");


const router = express.Router();




router.post("/",    saveFaqs);
router.put("/",    updateFaqs);
router.get("/",    fetchFaqs);
router.delete("/",    deleteFaqs);
module.exports = router;
