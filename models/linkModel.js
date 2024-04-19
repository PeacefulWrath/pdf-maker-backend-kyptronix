const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    link_preview_name:{
        type: String,
        required: true,
    },
    link_url: {
      type: String,
      required: true,
    }    
  },
  { timestamps: true }
);

const LinkModel = mongoose.model("LinkModel", linkSchema);

module.exports = LinkModel;
