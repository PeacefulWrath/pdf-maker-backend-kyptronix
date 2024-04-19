const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    template_name: {
      type: String,
      required: true,
    },
    template_preview_image: {
        type: String,
        required: true,
    },
    template_image: {
        type: String,
        required: true,
    },
    pdfs:[
        {
            type: mongoose.ObjectId,
            ref: "PdfModel",
        }
    ],
    zips:[
        {
            type: mongoose.ObjectId,
            ref: "ZipModel",
        }
    ],
    links:[
        {
            type: mongoose.ObjectId,
            ref: "PdfModel",
        }
    ]
  },
  { timestamps: true }
);

const TemplateModel = mongoose.model("TemplateModel", templateSchema);

module.exports = TemplateModel;
