const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
    {
        template_name:{
            type: String,
        },
        template_image:{
            type: String,
        },
        template_desc:{
            type: String,
        },
        template_pdfs:{
            type: mongoose.ObjectId,
            ref: "PdfModel",
        },
        template_zips:{
            type: mongoose.ObjectId,
            ref: "ZipModel",
        },
        template_links:{
            type: mongoose.ObjectId,
            ref: "LinkModel",
        }

    },
    { timestamps: true }
);

const TemplateModel = mongoose.model("TemplateModel", templateSchema);

module.exports = TemplateModel;
