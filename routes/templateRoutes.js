const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  saveTemplates,
  getTemplates,
  updateTemplates
 
} = require("../controllers/templateController");


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


router.post("/",   upload.array('files', 10), saveTemplates);
router.get("/", getTemplates);
router.put("/",   upload.array('files', 10), updateTemplates);


module.exports = router;
