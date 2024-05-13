const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  saveGallery,
  fetchGalleries,
  updateGallery,
  deleteGallery
} = require("../controllers/galleryController");

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
      name: "gallery",
    },
  ]),
  saveGallery
);

router.put("/", upload.fields([
  {
    name: "gallery",
  },
]), updateGallery);

router.get("/", fetchGalleries);

router.delete("/",deleteGallery)

module.exports = router;
