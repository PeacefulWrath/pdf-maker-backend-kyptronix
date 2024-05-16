const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
    saveCategories,
    fetchCategories,
    updateCategories,
    deleteCategories

} = require("../controllers/categoryController");


const router = express.Router();

if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

// Multer setup
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });




router.post("/", upload.fields([
    {
        name: "category",
    }
]), saveCategories);
router.put("/", upload.fields([
    {
        name: "category",
    }
]), updateCategories);
router.get("/", fetchCategories);
router.delete("/", deleteCategories);
module.exports = router;
