const FileModel = require("../models/fileModel");

exports.saveFileDetails = async (req, res) => {
  try {
    const fileData = await FileModel.create({
      file_name: req.body.file_name,
      file_data: req.body.file_data,
      accessible_by: req.body.accessible_by,
    });
    res.status(200).json({
      message: "file saved successfully",
      fileData,
    });
  } catch (error) {
    res.status(400).json({
      message: "failed to save file",
      error,
    });
  }
};

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

exports.getAllFiles = async (req, res) => {
  try {
    const fileData = await FileModel.find({});
    res.status(200).json({
      message: "all files",
      fileData,
    });
  } catch (error) {
    res.status(400).json({
      message: "failed to get all files",
      error,
    });
  }
};
