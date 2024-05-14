const ProductModel = require("../models/productModel");
const fs = require("fs");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");


dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
exports.saveProducts = async (req, res) => {
  try {
    let productModel = new ProductModel();
    productModel.name = req.body.company_name
    productModel.category = req.body.category
    productModel.real_price = req.body.real_price
    productModel.discounted_price= req.body.discounted_pice
    productModel.rate = req.body.rate

    for (var i = 0; i < req.files.product.length; i++) {
        var locaFilePath = req.files.product[i].path;
        var locaFileName = req.files.product[i].filename;
        let imageExtensions = ["png", "jpg", "jpeg", "gif"];
  
   
        if (imageExtensions.includes(locaFileName.split(".")[1])) {
          var resultImage = await uploadImageToCloudinary(
            locaFileName,
            locaFilePath
          );
          if (resultImage) {
            productModel.image = resultImage.url;
          }
        }
      
      }
    const insertedData = await productModel.save()
    if (insertedData) {
      return res.send(insertedData)
    } else {
      throw new Error("product not created")
    }


  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.fetchProducts = async (req, res) => {
    try {
      const fetchedData = await ProductModel.find({})
      if (fetchedData) {
        return res.send(fetchedData)
      } else {
        throw new Error("product not fetched")
      }
  
  
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  };