const McqModel = require("../models/mcqModel")
const fs = require("fs");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const path=require("path")

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
    //if options are images then use req.files ; if options are text use req.body.text_options
    //from req.body.total_options we can get no of options per question because if req.body.total_options is array it will be inorder like questions

    try {
        const mcqModel = new McqModel();
        let tempOptions = []

        if (!req.body.paper_name) {
            return res.status(400).send({ message: "paper name required" })
        }

        if (req.body.options_type && Array.isArray(req.body.options_type)) {
            for (let ot = 0; ot < req.body.options_type.length; ot++) {
                if (req.body.options_type[ot] === "image") {
                    for (var i = 0; i < req.files.length; i++) {
                        var locaFilePath = req.files[i].path;
                        var locaFileName = req.files[i].filename;
                        let imageExtensions = ["png", "jpg", "jpeg", "gif"];

                        if (imageExtensions.includes(locaFileName.split(".")[1])) {
                            var resultImage = await uploadImageToCloudinary(
                                locaFileName,
                                locaFilePath
                            );
                            if (resultImage) {
                                tempOptions.push(resultImage.url)
                            }
                        }
                    }
                } else if (req.body.options_type[ot] === "text") {
                    if (req.body.text_options&&Array.isArray(req.body.text_options)) {
                        req.body.text_options.forEach((op) => {
                            tempOptions.push(op)
                        })
                    }
                }
            }
        } else if (req.body.options_type) {
            if (req.body.options_type === "image") {
                for (var i = 0; i < req.files.length; i++) {
                    var locaFilePath = req.files[i].path;
                    var locaFileName = req.files[i].filename;
                    let imageExtensions = ["png", "jpg", "jpeg", "gif"];

                    if (imageExtensions.includes(locaFileName.split(".")[1])) {
                        var resultImage = await uploadImageToCloudinary(
                            locaFileName,
                            locaFilePath
                        );
                        if (resultImage) {
                            tempOptions.push(resultImage.url)
                        }
                    }
                }
            } else if (req.body.options_type === "text") {
                if (req.body.text_options) {
                    req.body.text_options.forEach((op) => {
                        tempOptions.push(op)
                    })
                }
            }
        }


        // all options in tempOptions

        mcqModel.paper_name = req.body.paper_name

        if (req.body.question && Array.isArray(req.body.question)) {
            
          
            for (let i = 0; i < req.body.question.length; i++) {
                mcqModel.mcqs.push({
                    question: "",
                    answer: "",
                    options_type: "",
                    options: []
                })
                mcqModel.mcqs[i].question = req.body.question[i]
              
                mcqModel.mcqs[i].options_type = req.body.options_type[i]
           
                if( mcqModel.mcqs[i].options_type==="text"){
                    mcqModel.mcqs[i].answer = req.body.answer_text[i]
                }
                
                if( mcqModel.mcqs[i].options_type==="image"){
                    // console.log("tooo",req.files.length-req.body.question[i].length)
                    let tempAnswer=[]
                    for(let k=0;k<req.answers.length;k++){
                        
                        var locaFilePath = req.answers[k].path;
                        var locaFileName = req.answers[k].filename;
                        let imageExtensions = ["png", "jpg", "jpeg", "gif"];
                       
                        if (imageExtensions.includes(locaFileName.split(".")[1])) {
                            var resultImage = await uploadImageToCloudinary(
                                locaFileName,
                                locaFilePath
                            );
                            if (resultImage) {
                                tempAnswer.push(resultImage.url)
                            }
                        }
                    }
                  
                          
                    mcqModel.mcqs[i].answer = tempAnswer[i]
                    
                }
                for (let j = 0; j <  4; j++) {
                    
                        mcqModel.mcqs[i].options.push(
                            tempOptions[j]
                        )
                    
                }
            }
        } else if (req.body.question) {

            mcqModel.mcqs.push({
                question: "",
                answer: "",
                options_type: "",
                options: []
            })
            mcqModel.mcqs[0].question = req.body.question
            if( req.body.options_type==="text"){
                mcqModel.mcqs[0].answer = req.body.answer_text
            }
            
            if( req.body.options_type==="image"){
               
             
                    
                    var locaFilePath = req.files[req.files.length-1].path;
                    var locaFileName = req.files[req.files.length-1].filename;
                    let imageExtensions = ["png", "jpg", "jpeg", "gif"];
                     let tempAnswer=[]
                    if (imageExtensions.includes(locaFileName.split(".")[1])) {
                        var resultImage = await uploadImageToCloudinary(
                            locaFileName,
                            locaFilePath
                        );
                        if (resultImage) {
                            tempAnswer.push(resultImage.url)
                        }
                    }
                
              
                      
                mcqModel.mcqs[0].answer = tempAnswer[0]
                
            }
            mcqModel.mcqs[0].options_type = req.body.options_type
            for (let j = 0; j < 4; j++) {
                
                mcqModel.mcqs[0].options.push(
                    tempOptions[j]
                )
            }

        }

        console.log("modd",mcqModel)
        const createdMcqData = await mcqModel.save()
        if (createdMcqData) {
            return res.status(200).send(createdMcqData)
        } else {
            throw new Error("mcq set created")
        }

    } catch (error) {
        return res.status(400).send({ message: error.message })
    }
}


exports.updateMcqTemplates = async (req, res) => {
    try {
       
        const mcqDocId = req.body.mcqDocId
        const mcqId = req.body.mcqId

        let addedMcqData;
        let updatedMcqData;


        if (req.body.update_old_data === 'yes') {
            const updateData = JSON.parse(req.body.updateData)

            // if replacableFile is array

            if (req.body.replacableFile && Array.isArray(req.body.replacableFile) && req.files) {
                let tempOptions=[];
                for (var i = 0; i < req.files.length; i++) {
                    var locaFilePath = req.files[i].path;
                    var locaFileName = req.files[i].filename;
                    let imageExtensions = ["png", "jpg", "jpeg", "gif"];

                    if (imageExtensions.includes(locaFileName.split(".")[1])) {
                        var resultImage = await uploadImageToCloudinary(
                            locaFileName,
                            locaFilePath
                        );
                        if (resultImage) {
                            tempOptions.push(resultImage.url)
                        }
                    }
                }

                const mcqDocData = await McqModel.findById(mcqDocId)
               
                let replacableFileIndex=0
                updateData.options=[]

               
                    for (let ele of mcqDocData?.mcqs) {
                        if (ele._id == mcqId) {
                            if (ele.options_type === "image") {                              
                            for(let i=0;i< ele.options.length;i++)
                            {
                                if(ele.options[i]===req.body.replacableFile[replacableFileIndex]){
                                    ele.options[i]=tempOptions[replacableFileIndex]
                                    replacableFileIndex ++;
                                }
                            }
                            }
                        }
                    }
                
                    
                    for (let ele of mcqDocData?.mcqs) {
                    
                     if (ele._id == mcqId) {
                        if (ele.options_type === "image") {   
                            for(let op of ele.options)
                            {
                                updateData.options.push(op)
                            }
                        }
                    
                  }
                }

                let updateObj = {};



            for (const key in updateData) {
                updateObj[`mcqs.$.${key}`] = updateData[key];
            }
            

            updatedMcqData = await McqModel.findOneAndUpdate(
                { _id: mcqDocId, 'mcqs._id': mcqId },
                { $set: updateObj },
                { returnDocument: 'after' })
            
            if (updatedMcqData && req.body.add_new_data == "no") {
                return res.status(200).send(updatedMcqData)
            }
            else if (updatedMcqData && req.body.add_new_data == "yes") {
                  console.log("flow transfer to add new data")
            }
            else {
                throw new Error("mcq not updated")
            }



            }

            // if replacableFile not array

            if (req.body.replacableFile && req.files) {


                let tempOption;
                for (var i = 0; i < req.files.length; i++) {
                    var locaFilePath = req.files[i].path;
                    var locaFileName = req.files[i].filename;
                    let imageExtensions = ["png", "jpg", "jpeg", "gif"];

                    if (imageExtensions.includes(locaFileName.split(".")[1])) {
                        var resultImage = await uploadImageToCloudinary(
                            locaFileName,
                            locaFilePath
                        );
                        if (resultImage) {
                            tempOption = resultImage.url
                        }
                    }
                }

                const mcqDocData = await McqModel.findById(mcqDocId)
                updateData.options=[]

                for (let ele of mcqDocData?.mcqs) {
                        if (ele._id == mcqId) {
                            if (ele.options_type === "image") {                              
                            for(let i=0;i< ele.options.length;i++)
                            {
                                if(ele.options[i]===req.body.replacableFile){
                                    ele.options[i]=tempOption
                                }
                            }
                            }
                        }
                    
                }

                for (let ele of mcqDocData?.mcqs) {
                     if (ele._id == mcqId) {
                        if (ele.options_type === "image") {   
                            for(let op of ele.options)
                            {
                                updateData.options.push(op)
                            }
                        }
                    }
                  
                }

                let updateObj = {};



            for (const key in updateData) {
                updateObj[`mcqs.$.${key}`] = updateData[key];
            }
           

            updatedMcqData = await McqModel.findOneAndUpdate(
                { _id: mcqDocId, 'mcqs._id': mcqId },
                { $set: updateObj },
                { returnDocument: 'after' })

                if (updatedMcqData && req.body.add_new_data == "no") {
                    return res.status(200).send(updatedMcqData)
                }
                else if (updatedMcqData && req.body.add_new_data == "yes") {
                      console.log("flow transfer to add new data")
                }
                else {
                    throw new Error("mcq not updated")
                }



            }
        }


        if (req.body.add_new_data === 'yes') {
            
            const newMcqData=req.body.newMcqData   
            addedMcqData = await McqModel.findOneAndUpdate(
                { _id: mcqDocId , 'mcqs._id': mcqId},
                { $push: { mcqs: JSON.parse(newMcqData) } },
                { returnDocument: 'after' }
            )
            if (addedMcqData) {
                
                return res.status(200).send(addedMcqData)
            }
            else {
                throw new Error("mcq not added")
            }
        }
    
    } catch (error) {
        return res.status(400).send({ message: error.message })
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