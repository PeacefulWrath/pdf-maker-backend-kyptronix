const express = require("express");
const {
    saveCus,
    fetchCus,
    updateCus,
    deleteCus
} = require("../controllers/cusController");


const router = express.Router();




router.post("/",    saveCus);
router.put("/",    updateCus);
router.get("/",    fetchCus);
router.delete("/",    deleteCus);
module.exports = router;
