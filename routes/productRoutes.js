const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  saveProducts, fetchProducts
} = require("../controllers/productController");


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
    name: "product",
  }
]), saveProducts);

router.get("/", fetchProducts);

module.exports = router;
