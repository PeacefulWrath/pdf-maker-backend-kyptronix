const McqModel = require("../models/mcqModel")
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


exports.saveMcqs = async (req, res) => {
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
                    if (req.body.text_options) {
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
            let tempOptionsInd = 0

            for (let i = 0; i < req.body.question.length; i++) {
                mcqModel.mcqs.push({
                    question: "",
                    answer: "",
                    options_type: "",
                    options: []
                })
                mcqModel.mcqs[i].question = req.body.question[i]
                mcqModel.mcqs[i].answer = req.body.answer[i]
                mcqModel.mcqs[i].options_type = req.body.options_type[i]
                for (let j = 0; j < req.body.total_options[i]; j++) {
                    if (tempOptionsInd < tempOptions.length) {
                        mcqModel.mcqs[i].options.push(
                            tempOptions[tempOptionsInd++]
                        )
                    }
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
            mcqModel.mcqs[0].answer = req.body.answer
            mcqModel.mcqs[0].options_type = req.body.options_type
            for (let j = 0; j < req.body.total_options; j++) {
                mcqModel.mcqs[0].options.push(
                    tempOptions[j]
                )
            }

        }

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


exports.updateMcqs = async (req, res) => {
    try {
        const mcqDocId = req.body.mcqDocId
        const mcqId = req.body.mcqId

        let addedData;
        let updatedMcqData;


        if (req.body.update_old_data === 'yes') {
            const updateData = JSON.parse(req.body.updateData)

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

                const mcqData = await McqModel.find({})

                updateData.options=[]

                for (let mcq of mcqData) {
                    for (let ele of mcq.mcqs) {
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
                }

                for (let mcq of mcqData) {
                  for (let ele of mcq.mcqs) {
                     if (ele._id == mcqId) {
                        if (ele.options_type === "image") {   
                            for(let op of ele.options)
                            {
                                updateData.options.push(op)
                            }
                        }
                    }
                  }
                }

                let updateObj = {};



            for (const key in updateData) {
                updateObj[`mcqs.$.${key}`] = updateData[key];
            }

            return res.status(200).send(updateObj)

            // updatedMcqData = await McqModel.findOneAndUpdate(
            //     { _id: mcqDocId, 'mcqs._id': mcqId },
            //     { $set: updateObj },
            //     { returnDocument: 'after' })

            // if (updatedMcqData && req.body.add_new_data == "no") {
            //     return res.status(200).send(updatedMcqData)
            // }
            // else {
            //     throw new Error("mcq not updated")
            // }



            }
        }
        // if (req.body.add_new_data === 'yes') {
        //     const newData=req.body.newData
        //     addedData = await findOneAndUpdate(
        //         { _id: mcqDocId },
        //         { $push: { mcqs: newData } },
        //         { returnDocument: 'after' }
        //     )
        //     if (addedData) {
        //         return res.status(200).send(addedData)
        //     }
        //     else {
        //         throw new Error("mcq not updated")
        //     }
        // }
    
    } catch (error) {
        return res.status(400).send({ message: error.message })
    }
}