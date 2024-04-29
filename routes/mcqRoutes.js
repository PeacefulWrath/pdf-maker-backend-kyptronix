const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
    saceMcqTemplates,
    updateMcqTemplates,
    getMcqTemplates,
    saveMcqTemplates
} = require("../controllers/mcqController");
const path=require("path")

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


router.post("/", upload.array('files')  , saveMcqTemplates);
router.put("/", upload.array('files') , updateMcqTemplates);
router.get("/",getMcqTemplates)

module.exports = router;