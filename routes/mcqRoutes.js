const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
    saveMcqs,
    updateMcqs
} = require("../controllers/mcqController");


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


router.post("/", upload.array('files') , saveMcqs);
router.put("/", upload.array('files') , updateMcqs);

module.exports = router;