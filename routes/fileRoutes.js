const express = require("express");
const {
  saveFileDetails,
  updateStatus,
  getAllFiles,
} = require("../controllers/fileController");

const router = express.Router();

router.post("/", saveFileDetails);
router.get("/", getAllFiles);
router.put("/", updateStatus);

module.exports = router;
