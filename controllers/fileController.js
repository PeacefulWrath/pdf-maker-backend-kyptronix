const FileModel = require("../models/fileModel");
const fs = require("fs");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

// exports.updateStatus = async (req, res) => {
//   try {
//     const updatedUser = await FileModel.findOneAndUpdate(
//       { _id: req.body.doc_id, "accessible_by.email": req.body.email },
//       { $set: { "accessible_by.$.status": req.body.status } },
//       { new: true }
//     );
//     if (updatedUser) {
//       res.status(200).json({
//         message: "User updated successfully",
//         updatedUser,
//       });
//     } else {
//       const accessibleBy = {
//         email: req.body.email,
//         status: req.body.status,
//       };
//       const saveUser = await FileModel.findOneAndUpdate(
//         { _id: req.body.doc_id },
//         { $push: { accessible_by: accessibleBy } },
//         { new: true }
//       );
//       res.status(201).json({
//         message: "user not found but user saved",
//         saveUser,
//       });
//     }
//   } catch (error) {
//     res.status(400).json({
//       message: "failed to update user",
//       error,
//     });
//   }
// };
dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(locaFileName, locaFilePath) {
  return cloudinary.v2.uploader
    .upload(locaFilePath, {
      public_id: locaFileName,
      folder: "pdfs/",
      use_filename: true,
    })
    .then((result) => {
      fs.unlinkSync(locaFilePath);
      return {
        message: "Success",
        url: result.secure_url,
      };
    })
    .catch((error) => {
      fs.unlinkSync(locaFilePath);
      console.log("cloudinary error", error);
      return { message: "Fail to upload in cloudinary" };
    });
}

exports.saveFileDetails = async (req, res) => {
  try {
    var locaFilePath = req.file.path;
    var locaFileName = req.file.filename;

    const result = await uploadToCloudinary(locaFileName, locaFilePath);

    if (result) {
      const insertedData = await FileModel.create({
        file_name: req.file.originalname,
        pdf_url: result.url,
      });
      if (insertedData) {
        res.status(200).send(insertedData);
      } else {
        throw new Error("cannotinsert data in db");
      }
    }
    throw new Error("error in saveFileDetails function ");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const filesData = await FileModel.find({});

    if (filesData) {
      res.status(201).send(filesData);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};
