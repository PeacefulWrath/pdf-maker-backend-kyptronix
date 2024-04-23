const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    links: [
      {
        link_preview_name: {
          type: String,
        },
        link_url: {
          type: String,
        }
      }
    ]
  },
  { timestamps: true }
);

const LinkModel = mongoose.model("LinkModel", linkSchema);

module.exports = LinkModel;
