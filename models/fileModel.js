const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    file_name: {
      type: String,
      required: true,
    },

    file_data: {
      type: String,
      required: true,
    },

    accessible_by: [
      {
        email: {
          type: String,
        },
        status: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const FileModel = mongoose.model("FileModel", fileSchema);

module.exports = FileModel;
