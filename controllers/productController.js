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
    productModel.name = req.body.name
    productModel.category = req.body.category
    productModel.real_price = req.body.real_price
    productModel.discounted_price = req.body.discounted_price
    productModel.star = req.body.star.toString()

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
    const fetchedData = await ProductModel.find({}).populate({
      path: "category",
      populate: { path: 'file_templates' }

    }).populate({
      path: "category",
      populate: { path: 'mcq_templates' }

    }).populate({
      path: "category",
      populate: { path: 'quiz_templates' }

    })
    if (fetchedData) {
      return res.send({
        success: true,
        message: "all product data", fetchedData
      })
    } else {
      throw new Error("product not fetched")
    }


  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.updateProducts = async (req, res) => {
  try {

    if (req.files && req.files.product && Array.isArray(req.files.product)) {
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
            req.body.image = resultImage.url;
          }
        }

      }
    
    }

    const updatedData = await ProductModel.findOneAndUpdate(
      { _id: { $eq: req.body.product_id } },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );
    if (updatedData) {
      return res.send(updatedData)
    } else {
      throw new Error("product not updated")
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.deleteProducts = async (req, res) => {
  try {
    const prodId = req.body.product_id;
  
   
    const deletedData=await ProductModel.findOneAndDelete(
     {_id:{$eq:prodId}}
   )
    if (deletedData) {
      return res.send(deletedData)
    } else {
      throw new Error("product not deleted")
    }


  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};