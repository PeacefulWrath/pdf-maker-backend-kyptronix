const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    paper_name: {
      type: String,
    },
    mcqs: [{
      question: {
        type: String,
      },
      options_type: {
        type: String
      },
      mark:{
        type:Number
      },
      explaination:{
        type: String
      },
      options: [{
        type: String,
      }],
      answer: {
        type: String
      }
    }]
  },
  { timestamps: true }
);

const McqModel = mongoose.model("McqModel", mcqSchema);

module.exports = McqModel;
