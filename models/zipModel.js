const mongoose = require("mongoose");

const zipSchema = new mongoose.Schema(
  {
    zips:
      [{
        file_name: {
          type: String,
          // unique:true
        },
        url:{
        type: String,
        },
        zip_downloadable:{
          type: Boolean,
        }
      }]
    
    
  },
  { timestamps: true }
);

const ZipModel = mongoose.model("ZipModel", zipSchema);

module.exports = ZipModel;
