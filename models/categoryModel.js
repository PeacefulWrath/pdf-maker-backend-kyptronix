const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    file_templates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileModel"
    }],
    mcq_templates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "McqModel"
    }],
    quiz_templates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizModel"
    }]
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("CategoryModel", categorySchema);

module.exports = CategoryModel;
