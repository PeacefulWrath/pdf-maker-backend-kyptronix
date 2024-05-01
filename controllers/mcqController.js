const McqModel = require("../models/mcqModel");
const fs = require("fs");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageToCloudinary(locaFileName, locaFilePath) {
  return cloudinary.v2.uploader
    .upload(locaFilePath, {
      public_id: locaFileName.split(".")[0],
      folder: "images/",
      use_filename: true,
    })
    .then((result) => {
      // fs.unlinkSync(locaFilePath);
      return {
        message: "Success",
        url: result.secure_url,
      };
    })
    .catch((error) => {
      // fs.unlinkSync(locaFilePath);
      console.log("cloudinary error", error);
      return { message: "Fail to upload in cloudinary" };
    });
}

exports.saveMcqTemplates = async (req, res) => {
  try {
    const mcqModel = new McqModel();
    let tempOptions = [];

    if (!req.body.paper_name) {
      return res.status(400).send({ message: "paper name required" });
    }

    if (req.body.options_type && Array.isArray(req.body.options_type)) {
      let imgOptStartIndex = 0;
      let imgOptEndIndex = 4;
      let textOptStartIndex = 0;
      let textOptEndIndex = 4;

      for (let ot = 0; ot < req.body.options_type.length; ot++) {
        if (req.body.options_type[ot] === "image") {
          for (var i = imgOptStartIndex; i < imgOptEndIndex; i++) {
            var locaFilePath = req.files.options[i].path;
            var locaFileName = req.files.options[i].filename;
            let imageExtensions = ["png", "jpg", "jpeg", "gif"];

            if (imageExtensions.includes(locaFileName.split(".")[1])) {
              var resultImage = await uploadImageToCloudinary(
                locaFileName,
                locaFilePath
              );
              if (resultImage) {
                tempOptions.push(resultImage.url);
              }
            }
          }

          imgOptStartIndex = imgOptEndIndex;
          imgOptEndIndex = imgOptEndIndex + 4;
        } else if (req.body.options_type[ot] === "text") {
          if (req.body.text_options && Array.isArray(req.body.text_options)) {
            for (var i = textOptStartIndex; i < textOptEndIndex; i++) {
              tempOptions.push(req.body.text_options[i]);
            }
            textOptStartIndex = textOptEndIndex;
            textOptEndIndex = textOptEndIndex + 4;
          }
        }
      }
    } else if (req.body.options_type) {
      if (req.body.options_type === "image") {
        for (var i = 0; i < req.files.options.length; i++) {
          var locaFilePath = req.files.options[i].path;
          var locaFileName = req.files.options[i].filename;
          let imageExtensions = ["png", "jpg", "jpeg", "gif"];

          if (imageExtensions.includes(locaFileName.split(".")[1])) {
            var resultImage = await uploadImageToCloudinary(
              locaFileName,
              locaFilePath
            );
            if (resultImage) {
              tempOptions.push(resultImage.url);
            }
          }
        }
      } else if (req.body.options_type === "text") {
        if (req.body.text_options) {
          req.body.text_options.forEach((op) => {
            tempOptions.push(op);
          });
        }
      }
    }

    // all options in tempOptions

    mcqModel.paper_name = req.body.paper_name;

    if (req.body.question && Array.isArray(req.body.question)) {
      let tempOptStartInd = 0;
      let tempOptEndInd = 4;

      for (let i = 0; i < req.body.question.length; i++) {
        mcqModel.mcqs.push({
          question: "",
          answer: "",
          options_type: "",
          options: [],
        });
        mcqModel.mcqs[i].question = req.body.question[i];

        mcqModel.mcqs[i].options_type = req.body.options_type[i];
        mcqModel.mcqs[i].mark = req.body.mark[i];
        mcqModel.mcqs[i].explaination = req.body.explaination[i];

        if (mcqModel.mcqs[i].options_type === "text") {
          mcqModel.mcqs[i].answer = JSON.parse(req.body.answer_text)[i];
        }

        if (mcqModel.mcqs[i].options_type === "image") {
          var locaFilePath =""
          var locaFileName =""
          // console.log("132",req.files)
          if(i>req.files.answers.length-1){
            locaFilePath = req.files.answers[i-1].path;
            locaFileName = req.files.answers[i-1].filename;
          }else{
            locaFilePath = req.files.answers[i].path;
            locaFileName = req.files.answers[i].filename;
          }
          let imageExtensions = ["png", "jpg", "jpeg", "gif"];
          if (imageExtensions.includes(locaFileName.split(".")[1])) {
            var resultImage = await uploadImageToCloudinary(
              locaFileName,
              locaFilePath
            );
            if (resultImage) {
              mcqModel.mcqs[i].answer = resultImage.url;
            }
          }
        }
        for (let j = tempOptStartInd; j < tempOptEndInd; j++) {
          mcqModel.mcqs[i].options.push(tempOptions[j]);
        }
        tempOptStartInd = tempOptEndInd;
        tempOptEndInd = tempOptEndInd + 4;
      }
    } else if (req.body.question) {
      mcqModel.mcqs.push({
        question: "",
        answer: "",
        options_type: "",
        options: [],
      });
      mcqModel.mcqs[0].question = req.body.question;
      if (req.body.options_type === "text") {
        mcqModel.mcqs[0].answer = JSON.parse(req.body.answer_text)[0];;
      }

      if (req.body.options_type === "image") {
        var locaFilePath = req.files[req.files.length - 1].path;
        var locaFileName = req.files[req.files.length - 1].filename;
        let imageExtensions = ["png", "jpg", "jpeg", "gif"];
        let tempAnswer = [];
        if (imageExtensions.includes(locaFileName.split(".")[1])) {
          var resultImage = await uploadImageToCloudinary(
            locaFileName,
            locaFilePath
          );
          if (resultImage) {
            tempAnswer.push(resultImage.url);
          }
        }

        mcqModel.mcqs[0].answer = tempAnswer[0];
      }
      mcqModel.mcqs[0].options_type = req.body.options_type;
      mcqModel.mcqs[0].mark = req.body.mark;
        mcqModel.mcqs[0].explaination = req.body.explaination;
      for (let j = 0; j < 4; j++) {
        mcqModel.mcqs[0].options.push(tempOptions[j]);
      }
    }

    const createdMcqData = await mcqModel.save();
    if (createdMcqData) {
      return res.status(200).send(createdMcqData);
    } else {
      throw new Error("mcq set created");
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.updateMcqTemplates = async (req, res) => {
  try {
    console.log("update")
    console.log(JSON.parse(req.body.updated_data))
    // res.send([])
    McqModel.paper_name=req.body.paper_name
    const updatedTemplateData = await McqModel.findOneAndUpdate(
      { _id: { $eq: req.body.mcqDocId } },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (updatedTemplateData) {
      return res.status(200).send(updatedTemplateData);
    } else {
      throw new Error("cannot update the template");
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.getMcqTemplates = async (req, res) => {
  try {
    const allMcqTemplates = await McqModel.find({});

    if (allMcqTemplates) {
      return res.status(200).send(allMcqTemplates);
    }
    throw new Error("templates not found");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
