const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { saveTestimonials, fetchTestimonials, updateTestimonials, deleteTestimonials } = require("../controllers/testimonialController");


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
    name: "testimonial",
  }
]), saveTestimonials);

router.get("/", fetchTestimonials);
router.put("/", upload.fields([
  {
    name: "testimonial",
  }
]), updateTestimonials);

router.delete("/", deleteTestimonials);

module.exports = router;
