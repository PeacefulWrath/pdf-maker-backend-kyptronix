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
          var locaFilePath = ""
          var locaFileName = ""
          // console.log("132",req.files)
          if (i > req.files.answers.length - 1) {
            locaFilePath = req.files.answers[i - 1].path;
            locaFileName = req.files.answers[i - 1].filename;
          } else {
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

    let updatedPaperName = undefined

    if (req.body.paper_name) {
      // console.log("paper name")
      updatedPaperName = await McqModel.findOneAndUpdate(
        { _id: req.body.mcqDocId },
        {
          $set: {
            "paper_name": req.body.paper_name,
          }
        },
        { returnDocument: "after" }
      );

      // console.log(updatedPaperName)
    }



    // console.log("update")
    // console.log(JSON.parse(req.body.updated_data))
    // console.log("211",req.files)



    let updateData = JSON.parse(req.body.updated_data)



    // console.log("219",mcqDocData)
    // console.log(updateData)





    let isDataUpdated = undefined
    let dbImgOptionsIndex = 0
    let dbImgAnswersIndex = 0

    for (let k = 0; k < updateData.length; k++) {

      // console.log("update")


      if (updateData[k].db_options_replacable_option_type && updateData[k].db_options_replacable_option_type === "image") {


        // let prticularMcq=mcqDocData.mcqs[updateData[k].db_options_replacable_question_no]

        locaFilePath = req.files.db_options[dbImgOptionsIndex].path;
        locaFileName = req.files.db_options[dbImgOptionsIndex].filename;


        let imageExtensions = ["png", "jpg", "jpeg", "gif"];


        if (imageExtensions.includes(locaFileName.split(".")[1])) {
          var resultImage = await uploadImageToCloudinary(
            locaFileName,
            locaFilePath
          );
          // console.log("url",resultImage.url)
          if (resultImage) {
            // prticularMcq.options[updateData[k].db_options_replacable_option_index] = resultImage.url

            const updatedDataImgOpt = await McqModel.findOneAndUpdate(
              { _id: req.body.mcqDocId },
              {
                $set: {
                  [`mcqs.${updateData[k].db_options_replacable_question_no}.options.${updateData[k].db_options_replacable_option_index}`]: resultImage.url,
                }
              },
              { returnDocument: "after" }
            );
            // console.log("OOO",updateDataRR.mcqs[1].options)
            if (updatedDataImgOpt) {
              isDataUpdated = "yes"
              dbImgOptionsIndex++
            } else {
              isDataUpdated = "no"
            }
          }
        }



      }


      if (updateData[k].db_options_text_replacable_option_type && updateData[k].db_options_text_replacable_option_type === "text") {







        const updatedDataTextOpt = await McqModel.findOneAndUpdate(
          { _id: req.body.mcqDocId },
          {
            $set: {
              [`mcqs.${updateData[k].db_options_text_replacable_question_no}.options.${updateData[k].db_options_text_replacable_option_index}`]: updateData[k].db_options_text_data,
            }
          },
          { returnDocument: "after" }
        );
        // console.log("OOO",updateDataRR.mcqs[1].options)
        if (updatedDataTextOpt) {
          isDataUpdated = "yes"

        } else {
          isDataUpdated = "no"
        }

      }


      if (updateData[k].db_answers_replacable_question_no) {


        // let prticularMcq=mcqDocData.mcqs[updateData[k].db_options_replacable_question_no]

        locaFilePath = req.files.db_answers[dbImgAnswersIndex].path;
        locaFileName = req.files.db_answers[dbImgAnswersIndex].filename;


        let imageExtensions = ["png", "jpg", "jpeg", "gif"];


        if (imageExtensions.includes(locaFileName.split(".")[1])) {
          var resultImage = await uploadImageToCloudinary(
            locaFileName,
            locaFilePath
          );
          // console.log("url",resultImage.url)
          if (resultImage) {
            // prticularMcq.options[updateData[k].db_options_replacable_option_index] = resultImage.url

            const updatedDataImgAns = await McqModel.findOneAndUpdate(
              { _id: req.body.mcqDocId },
              {
                $set: {
                  [`mcqs.${updateData[k].db_options_replacable_question_no}.answer`]: resultImage.url,
                }
              },
              { returnDocument: "after" }
            );
            // console.log("OOO",updateDataRR.mcqs[1].options)
            if (updatedDataImgAns) {
              isDataUpdated = "yes"
              dbImgAnswersIndex++
            } else {
              isDataUpdated = "no"
            }
          }
        }



      }


      if (updateData[k].db_text_answer_replacable_option_type && updateData[k].db_text_answer_replacable_option_type === "text") {







        const updatedDataTextAns = await McqModel.findOneAndUpdate(
          { _id: req.body.mcqDocId },
          {
            $set: {
              [`mcqs.${updateData[k].db_text_answer_replacable_question_no}.answer`]: updateData[k].db_text_answer_data,
            }
          },
          { returnDocument: "after" }
        );
        // console.log("OOO",updateDataRR.mcqs[1].options)
        if (updatedDataTextAns) {
          isDataUpdated = "yes"

        } else {
          isDataUpdated = "no"
        }

      }


      if (updateData[k].db_marks_replacable_option_type && updateData[k].db_marks_replacable_option_type === "text") {







        const updatedDataMarks = await McqModel.findOneAndUpdate(
          { _id: req.body.mcqDocId },
          {
            $set: {
              [`mcqs.${updateData[k].db_marks_replacable_question_no}.mark`]: updateData[k].db_marks_data,
            }
          },
          { returnDocument: "after" }
        );
        // console.log("OOO",updateDataRR.mcqs[1].options)
        if (updatedDataMarks) {
          isDataUpdated = "yes"

        } else {
          isDataUpdated = "no"
        }

      }

      if (updateData[k].db_explaination_replacable_option_type && updateData[k].db_explaination_replacable_option_type === "text") {







        const updatedDataExp = await McqModel.findOneAndUpdate(
          { _id: req.body.mcqDocId },
          {
            $set: {
              [`mcqs.${updateData[k].db_explaination_replacable_question_no}.explaination`]: updateData[k].db_explaination_data,
            }
          },
          { returnDocument: "after" }
        );
        // console.log("OOO",updateDataRR.mcqs[1].options)
        if (updatedDataExp) {
          isDataUpdated = "yes"

        } else {
          isDataUpdated = "no"
        }

      }


      if (updateData[k].db_questions_replacable_option_type && updateData[k].db_questions_replacable_option_type === "text") {







        const updatedDataQues = await McqModel.findOneAndUpdate(
          { _id: req.body.mcqDocId },
          {
            $set: {
              [`mcqs.${updateData[k].db_questions_replacable_question_no}.explaination`]: updateData[k].db_questions_data,
            }
          },
          { returnDocument: "after" }
        );
        // console.log("OOO",updateDataRR.mcqs[1].options)
        if (updatedDataQues) {
          isDataUpdated = "yes"

        } else {
          isDataUpdated = "no"
        }

      }

    }










    //add new data

    const mcqDocData = await McqModel.findById(req.body.mcqDocId);
    // console.log("prev",mcqDocData)

    let tempOptions = [];
    let tempMcqLength = mcqDocData.mcqs.length

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

    if (req.body.question && Array.isArray(req.body.question)) {
      let tempOptStartInd = 0;
      let tempOptEndInd = 4;

      for (let i = 0; i < req.body.question.length; i++) {
        mcqDocData.mcqs.push({
          question: "",
          answer: "",
          options_type: "",
          options: [],
        });
        mcqDocData.mcqs[tempMcqLength].question = req.body.question[i];

        mcqDocData.mcqs[tempMcqLength].options_type = req.body.options_type[i];
        mcqDocData.mcqs[tempMcqLength].mark = req.body.mark[i];
        mcqDocData.mcqs[tempMcqLength].explaination = req.body.explaination[i];

        if (mcqDocData.mcqs[tempMcqLength].options_type === "text") {
          mcqDocData.mcqs[tempMcqLength].answer = JSON.parse(req.body.answer_text)[i];
        }

        if (mcqDocData.mcqs[tempMcqLength].options_type === "image") {
          var locaFilePath = ""
          var locaFileName = ""
          // console.log("132",req.files)
          if (i > req.files.answers.length - 1) {
            locaFilePath = req.files.answers[i - 1].path;
            locaFileName = req.files.answers[i - 1].filename;
          } else {
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
              mcqDocData.mcqs[tempMcqLength].answer = resultImage.url;
            }
          }
        }
        for (let j = tempOptStartInd; j < tempOptEndInd; j++) {
          mcqDocData.mcqs[tempMcqLength].options.push(tempOptions[j]);
        }
        tempOptStartInd = tempOptEndInd;
        tempOptEndInd = tempOptEndInd + 4;
        tempMcqLength++
      }

    } else if (req.body.question) {
      mcqDocData.mcqs.push({
        question: "",
        answer: "",
        options_type: "",
        options: [],
      });
      mcqDocData.mcqs[tempMcqLength].question = req.body.question;
      if (req.body.options_type === "text") {
        mcqDocData.mcqs[tempMcqLength].answer = JSON.parse(req.body.answer_text)[0];;
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

        mcqDocData.mcqs[tempMcqLength].answer = tempAnswer[0];
      }
      mcqDocData.mcqs[tempMcqLength].options_type = req.body.options_type;
      mcqDocData.mcqs[tempMcqLength].mark = req.body.mark;
      mcqDocData.mcqs[tempMcqLength].explaination = req.body.explaination;
      for (let j = 0; j < 4; j++) {
        mcqDocData.mcqs[tempMcqLength].options.push(tempOptions[j]);
      }
    }


    // console.log("___",mcqDocData)

    let addedMcqData = undefined

    if (req.body.options_type && req.body.question) {
      addedMcqData = await McqModel.findOneAndUpdate(
        { _id: { $eq: req.body.mcqDocId } },
        {
          ...mcqDocData,
        },
        {
          new: true,
        }
      );
    }


    if (addedMcqData && isDataUpdated == "yes") {
      return res.status(200).send({ "addedData": addedMcqData, "isUpdated": isDataUpdated });
    } else if (addedMcqData) {
      return res.status(200).send(addedMcqData);
    } else if (!addedMcqData && !isDataUpdated && updatedPaperName) {
      return res.status(200).send("only paper name updated");
    } else {
      throw new Error("mcq can't be updated");
    }

  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
}

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

exports.deleteMcqTemplates=async(req,res)=>{
  try{
    const mcqDocId = req.body.mcqDocId;
  
       const deletedData=await McqModel.findOneAndDelete(
        {_id:{$eq:mcqDocId}}
      )
  
      if(deletedData){
        return res.status(200).send({message:"mcq template deleted successfully"})
      }else{
        throw new Error("cannot delete mcq template")
      }
  
  }catch (error) {
      res.status(400).send({ message: error.message });
    }
}
