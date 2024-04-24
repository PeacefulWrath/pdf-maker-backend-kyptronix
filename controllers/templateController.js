const TemplateModel = require("../models/templateModel");
const PdfModel = require("../models/pdfModel");
const ZipModel = require("../models/zipModel");
const LinkModel = require("../models/linkModel");
const fs = require("fs");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("12345");
var https = require("https");
var path = require("path");
var request = require("request");

dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadPdfToCloudinary(locaFileName, locaFilePath) {
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

async function uploadImageToCloudinary(locaFileName, locaFilePath) {
  return cloudinary.v2.uploader
    .upload(locaFilePath, {
      public_id: locaFileName,
      folder: "images/",
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

async function uploadZipToCloudinary(locaFileName, locaFilePath) {
  return cloudinary.v2.uploader
    .upload(locaFilePath, {
      public_id: locaFileName,
      folder: "zips/",
      use_filename: true,
      resource_type: "auto",
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


exports.saveTemplates = async (req, res) => {
  try {

    // console.log("loop", req.body)

    
    const pdfsModel = new PdfModel();
    const templateModel = new TemplateModel()
    const zipsModel = new ZipModel();
    const linksModel = new LinkModel()

    let getPdfs = [];
    let getZips = [];
    let getLinks = []
   
      
    let waterMarkInd=0;
    let logoInd=0;
    let pageNoInd=0;
    let pdfDownloadableInd=0;
    let zipDownloadableInd=0;

    for (var i = 0; i < req.files.length; i++) {
      
      var locaFilePath = req.files[i].path;
      var locaFileName = req.files[i].filename;
      let imageExtensions = ['png', 'jpg', 'jpeg', 'gif'];

      if (locaFileName.split(".")[1] === "pdf") {
        var resultPdf = await uploadPdfToCloudinary(locaFileName, locaFilePath);
        if(resultPdf){
         getPdfs.push({
          file_name: locaFileName,
          url: cryptr.encrypt(resultPdf.url),
          watermark: Array.isArray(req.body.watermark) ? (waterMarkInd<req.body.watermark.length ? req.body.watermark[waterMarkInd++]:" ") : req.body.watermark,
          top_left_logo:  Array.isArray(req.body.top_left_logo) ? (logoInd<req.body.top_left_logo.length ? req.body.top_left_logo[logoInd++]:" ") : req.body.top_left_logo,
          bottom_right_page_no:  Array.isArray(req.body.bottom_right_page_no) ? (pageNoInd<req.body.bottom_right_page_no.length ? req.body.bottom_right_page_no[pageNoInd++]:" ") : req.body.bottom_right_page_no,
          pdf_downloadable:  Array.isArray(req.body.pdf_downloadable) ? (pdfDownloadableInd<req.body.pdf_downloadable.length ? req.body.pdf_downloadable[pdfDownloadableInd++]:" ") : req.body.pdf_downloadable,
        })
      }
      }
      if (imageExtensions.includes(locaFileName.split(".")[1])) {
        var resultImage = await uploadImageToCloudinary(locaFileName, locaFilePath);
        if(resultImage){
        templateModel.template_image = resultImage.url
        }
      }
      if (locaFileName.split(".")[1] === "zip") {
        var resultZip = await uploadZipToCloudinary(locaFileName, locaFilePath);
        if(resultZip){
        getZips.push({
          file_name: locaFileName,
          url: cryptr.encrypt(resultZip.url),
          zip_downloadable: Array.isArray(req.body.zip_downloadable) ? (zipDownloadableInd<req.body.zip_downloadable.length ? req.body.zip_downloadable[zipDownloadableInd++]:" ") : req.body.zip_downloadable,
        })
      }
      }
    }
   
    if (req.body.link_preview_name && Array.isArray(req.body.link_preview_name)) {
      for (let i = 0; i < req.body.link_preview_name.length; i++) {
        getLinks.push({link_preview_name  : req.body.link_preview_name[i] })
      }
    } else if (req.body.link_preview_name) {
      getLinks.push({link_preview_name  : req.body.link_preview_name })
    }


    if (req.body.link_url && Array.isArray(req.body.link_url)) {
      for (let i = 0; i < req.body.link_url.length; i++) {

        getLinks[i].link_url = req.body.link_url[i] 

      }
    } else if (req.body.link_url) {
      getLinks[0].link_url = req.body.link_url 
    }

    // console.log("gpdfs",getPdfs)
    // console.log("gzips",getZips)

    pdfsModel.pdfs = getPdfs;
    zipsModel.zips = getZips;
    linksModel.links = getLinks;

    const insertedPdfsData = await pdfsModel.save();
    const insertedZipsData = await zipsModel.save();
    const insertedLinksData = await linksModel.save();


    templateModel.template_name = req.body.template_name
    templateModel.template_desc = req.body.template_desc
    templateModel.template_pdfs = insertedPdfsData._id
    templateModel.template_zips = insertedZipsData._id
    templateModel.template_links = insertedLinksData._id

    const insertedTemplateData = await templateModel.save();
    const populatedData=await TemplateModel.find({_id:insertedTemplateData._id}).populate("template_pdfs").populate("template_zips").populate("template_links")
    // console.log("pop",populatedData)
    if (populatedData) {
      return res.status(200).send(populatedData[0]);
    } else {
      throw new Error("cannot insert data in db");
    }


  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.getTemplates = async (req, res) => {
  try {

    

    const allTemplates=await TemplateModel.find({}).populate("template_pdfs").populate("template_zips").populate("template_links")

    if(allTemplates){
      return res.status(200).send(allTemplates)
    }
    throw new Error ("templates not found")


  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
