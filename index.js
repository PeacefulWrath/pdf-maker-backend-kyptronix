const express = require("express");
const multer = require("multer");
const pdfLib = require("pdf-lib");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const FileModel = require("./models/fileModel");
const connectDB = require("./config/db");
// var qpdf = require("node-qpdf");

// var options = {
//   keyLength: 128,
//   password: "12345",
// };

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT;

app.post("/api/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    // console.log("pgg", req.file);

    const pdfBuffer = fs.readFileSync(req.file.path);

    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    const watermarkImageBytes = fs.readFileSync("./logo.png");

    const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      page.drawImage(watermarkImage, {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        opacity: 0.5,
      });
    });

    // Encrypt PDF
    const encryptedPdfBytes = await pdfDoc.save();

    // Store encrypted PDF in MongoDB

    // console.log("inn", insertedData);

    const encryptedPdfBuffer = Buffer.from(encryptedPdfBytes);

    const insertedData = await FileModel.create({
      pdf: encryptedPdfBuffer,
    });

    res.setHeader("Content-Type", "application/pdf");

    if (insertedData) {
      res.send(encryptedPdfBuffer);
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

app.get("/api/allPdfs", async (req, res) => {
  try {
    const findData = await FileModel.find({});

    if (findData) {
      res.send(findData);
    }
  } catch (error) {
    res.send(error.message);
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
