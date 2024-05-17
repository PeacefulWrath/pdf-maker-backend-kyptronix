const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
 savePartners,
 updatePartners,
 getPartners,
 deletePartners
} = require("../controllers/partnerController");


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
    name: "partner",
  }
]), savePartners);

router.get("/", getPartners);
router.put("/", upload.fields([
  {
    name: "partner",
  }
]), updatePartners);

router.delete("/", deletePartners);

module.exports = router;
