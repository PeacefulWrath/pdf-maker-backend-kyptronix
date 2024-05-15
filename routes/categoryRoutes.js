const express = require("express");
const {
    saveCategories,
    fetchCategories,
    updateCategories,
    deleteCategories
    
} = require("../controllers/categoryController");


const router = express.Router();




router.post("/",    saveCategories);
router.put("/",    updateCategories);
router.get("/",    fetchCategories);
router.delete("/",    deleteCategories);
module.exports = router;
