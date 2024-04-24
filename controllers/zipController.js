const ZipModel = require("../models/zipModel");
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
const CONVERTER_API_KEY = process.env.CONVERTER_API_KEY;

async function uploadToCloudinary(locaFileName, locaFilePath) {
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

exports.saveZipDetails = async (req, res) => {
  try {
        const zips = new ZipModel({ ...req.body });
        let getZips = [];
        for (var i = 0; i < req.files.length; i++) {
          var locaFilePath = req.files[i].path;
          var locaFileName = req.files[i].filename;
         
          var result = await uploadToCloudinary(locaFileName,locaFilePath);
        
          getZips.push(cryptr.encrypt(result.url));
        }

        zips.zip_url = getZips;
        const insertedData= await zips.save();

        if (insertedData) {
          return res.status(200).send(insertedData);
        } else {
          throw new Error("cannot insert data in db");
        }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.getAllZips = async (req, res) => {
  try {
    const zipsData = await ZipModel.find({});
    let tempZipsData=zipsData
    // console.log("pdd",pdfsData)
    if (zipsData) {
      for(let i=0;i<zipsData.length;i++){
        zipsData[i].zips.forEach((zip)=>{
          zip.url=cryptr.decrypt(zip.url)
        })
      } 
      // console.log("pdd",tempPdfsData);
      res.status(201).send(tempZipsData);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

