const CategoryModel = require("../models/categoryModel");

const dotenv = require("dotenv");

exports.saveCategories = async (req, res) => {
  try {
    let categoryModel = new CategoryModel();

    categoryModel.name = req.body.name
    categoryModel.file_templates = req.body.file_templates
    categoryModel.mcq_templates = req.body.mcq_templates
    categoryModel.quiz_templates = req.body.quiz_templates

    const insertedData = await categoryModel.save()
    if (insertedData) {
      return res.send(insertedData)
    } else {
      throw new Error("category not created")
    }


  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.fetchCategories = async (req, res) => {
  try {
    const allCategoryData = await CategoryModel.find({}).populate("file_templates").populate("mcq_templates").populate("quiz_templates")
    if (allCategoryData) {
      return res.send({
        success: true,
        message: "all category data", allCategoryData
      })
    } else {
      throw new Error("categories not fetched")
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.updateCategories= async (req, res) => {
  try {
   
    const updatedData = await CategoryModel.findOneAndUpdate(
      { _id: { $eq: req.body.category_id } },
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
      throw new Error("category not updated")
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};


exports.deleteCategories = async (req, res) => {
  try {
    const catId = req.body.cat_id;
  
   
    const deletedData=await CategoryModel.findOneAndDelete(
     {_id:{$eq:catId}}
   )
    if (deletedData) {
      return res.send(deletedData)
    } else {
      throw new Error("category not deleted")
    }


  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};