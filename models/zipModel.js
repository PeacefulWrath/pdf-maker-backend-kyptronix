const mongoose = require("mongoose");

const zipSchema = new mongoose.Schema(
  {
    file_name: {
      type: String,
      
    },
    zip_url: [{
      type: String,
    
    }],
    downloadable:{
      type: Boolean,
    }
  },
  { timestamps: true }
);

const ZipModel = mongoose.model("ZipModel", zipSchema);

module.exports = ZipModel;
