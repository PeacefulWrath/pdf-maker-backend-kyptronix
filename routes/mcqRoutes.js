const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  deleteMcqTemplates,
  updateMcqTemplates,
  getMcqTemplates,
  saveMcqTemplates,
} = require("../controllers/mcqController");
const path = require("path");

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

router.post(
  "/",
  upload.fields([
    {
      name: "options",
    },
    {
      name: "answers",
    },
  ]),
  saveMcqTemplates
);
router.put("/", upload.fields([
  {
    name: "db_options",
  },
  {
    name: "db_answers",
  },
  {
    name: "options",
  },
  {
    name: "answers",
  },
]), updateMcqTemplates);
router.get("/", getMcqTemplates);
router.delete("/",deleteMcqTemplates)
module.exports = router;
