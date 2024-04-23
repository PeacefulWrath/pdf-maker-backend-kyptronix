const PdfModel = require("../models/pdfModel");
const fs = require("fs");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("12345");
var https = require("https");
var path = require("path");
var request = require("request");

// const convertFiles=async(srcFilePath)=>{
//   try{

//   // Source DOC or DOCX file
//   const SourceFile = `./uploads/${srcFilePath.split("\\")[1]}`;
//   // Destination PDF file name
//   const DestinationFile = "./converted.pdf";

//   // 1. RETRIEVE PRESIGNED URL TO UPLOAD FILE.
//   getPresignedUrl(API_KEY, SourceFile)
//       .then(([uploadUrl, uploadedFileUrl]) => {
//           // 2. UPLOAD THE FILE TO CLOUD.
//           uploadFile(API_KEY, SourceFile, uploadUrl)
//               .then(() => {
//                   // 3. CONVERT UPLOADED DOC (DOCX) FILE TO PDF
//                    convertDocToPdf(API_KEY, uploadedFileUrl, DestinationFile);

//               })
//               .catch(e => {
//                   console.log(e);
//               });
//       })
//       .catch(e => {
//           console.log(e);
//       });

//   function getPresignedUrl(apiKey, localFile) {
//       return new Promise(resolve => {
//           // Prepare request to `Get Presigned URL` API endpoint
//           let queryPath = `/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${path.basename(SourceFile)}`;
//           let reqOptions = {
//               host: "api.pdf.co",
//               path: encodeURI(queryPath),
//               headers: { "x-api-key": API_KEY }
//           };
//           // Send request
//           https.get(reqOptions, (response) => {
//               response.on("data", (d) => {
//                   let data = JSON.parse(d);
//                   if (data.error == false) {
//                       // Return presigned url we received
//                       resolve([data.presignedUrl, data.url]);
//                   }
//                   else {
//                       // Service reported error
//                       console.log("getPresignedUrl(): " + data.message);
//                   }
//               });
//           })
//               .on("error", (e) => {
//                   // Request error
//                   console.log("getPresignedUrl(): " + e);
//               });
//       });
//   }

//   function uploadFile(apiKey, localFile, uploadUrl) {
//       return new Promise(resolve => {
//           fs.readFile(SourceFile, (err, data) => {
//               request({
//                   method: "PUT",
//                   url: uploadUrl,
//                   body: data,
//                   headers: {
//                       "Content-Type": "application/octet-stream"
//                   }
//               }, (err, res, body) => {
//                   if (!err) {
//                       resolve();
//                   }
//                   else {
//                       console.log("uploadFile() request error: " + e);
//                   }
//               });
//           });
//       });
//   }

//    function convertDocToPdf(apiKey, uploadedFileUrl, destinationFile) {
//       // Prepare URL for `DOC To PDF` API call
//       let queryPath = `/v1/pdf/convert/from/doc`;

//       // JSON payload for api request
//       var jsonPayload = JSON.stringify({
//           name: path.basename(destinationFile), url: uploadedFileUrl
//       });

//       var reqOptions = {
//           host: "api.pdf.co",
//           method: "POST",
//           path: queryPath,
//           headers: {
//               "x-api-key": apiKey,
//               "Content-Type": "application/json",
//               "Content-Length": Buffer.byteLength(jsonPayload, 'utf8')
//           }
//       };

//       // Send request
//       var postRequest = https.request(reqOptions, (response) => {
//           response.on("data", (d) => {
//               response.setEncoding("utf8");
//               // Parse JSON response
//               let data = JSON.parse(d);
//               if (data.error == false) {
//                   // Download PDF file
//                   var file = fs.createWriteStream(destinationFile);
//                   https.get(data.url, (response2) => {
//                       response2.pipe(file)
//                           .on("close", () => {
//                               console.log(`Generated PDF file saved as "${destinationFile}" file.`);
//                               return true
//                           });
//                   });
//               }
//               else {
//                   // Service reported error
//                   console.log("readBarcodes(): " + data.message);
//               }
//           });
//       })
//           .on("error", (e) => {
//               // Request error
//               console.log("readBarcodes(): " + e);
//           });

//       // Write request data
//       postRequest.write(jsonPayload);
//       postRequest.end();
//   }

//   }catch(err){
//       res.send({message:"failed to convert the file"})
//   }

//   }

// exports.updateStatus = async (req, res) => {
//   try {
//     const updatedUser = await FileModel.findOneAndUpdate(
//       { _id: req.body.doc_id, "accessible_by.email": req.body.email },
//       { $set: { "accessible_by.$.status": req.body.status } },
//       { new: true }
//     );
//     if (updatedUser) {
//       res.status(200).json({
//         message: "User updated successfully",
//         updatedUser,
//       });
//     } else {
//       const accessibleBy = {
//         email: req.body.email,
//         status: req.body.status,
//       };
//       const saveUser = await FileModel.findOneAndUpdate(
//         { _id: req.body.doc_id },
//         { $push: { accessible_by: accessibleBy } },
//         { new: true }
//       );
//       res.status(201).json({
//         message: "user not found but user saved",
//         saveUser,
//       });
//     }
//   } catch (error) {
//     res.status(400).json({
//       message: "failed to update user",
//       error,
//     });
//   }
// };

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
      folder: "pdfs/",
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

exports.saveFileDetails = async (req, res) => {
  try {
        const pdfsModel = new PdfModel({ ...req.body });

        let getPdfs = [];
        
        for (var i = 0; i < req.files.length; i++) {
          var locaFilePath = req.files[i].path;
          var locaFileName = req.files[i].filename;
         
          var result = await uploadToCloudinary(locaFileName,locaFilePath);
          getPdfs.push({
            file_name: locaFileName,
            url: cryptr.encrypt(result.url)
          })
          
        }
        
        pdfsModel.pdfs = getPdfs;
        const insertedData= await pdfsModel.save();

        if (insertedData) {
          return res.status(200).send(insertedData);
        } else {
          throw new Error("cannot insert data in db");
        }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const pdfsData = await PdfModel.find({});
console.log(pdfsData)
    if (pdfsData) {
      const tempData = [];
      pdfsData?.pdfs?.forEach((pdf) => {
        let tempUrls=[]
        pdf.url.forEach((url)=>{
           tempUrls.push(cryptr.decrypt(url))
        }) 
        pdf.url=tempUrls
      });
      pdfsData.forEach((pdf)=>{
        tempData.push(pdf);
      })
    
      res.status(201).send(tempData);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.convertFiles = async (req, res) => {
  try {
    // Source DOC or DOCX file
    const SourceFile = `./uploads/${req.file.path.split("\\")[1]}`;
    // Destination PDF file name
    const DestinationFile = "./converted.pdf";

    // 1. RETRIEVE PRESIGNED URL TO UPLOAD FILE.
    getPresignedUrl(CONVERTER_API_KEY, SourceFile)
      .then(([uploadUrl, uploadedFileUrl]) => {
        // 2. UPLOAD THE FILE TO CLOUD.
        uploadFile(CONVERTER_API_KEY, SourceFile, uploadUrl)
          .then(() => {
            // 3. CONVERT UPLOADED DOC (DOCX) FILE TO PDF
            convertDocToPdf(
              CONVERTER_API_KEY,
              uploadedFileUrl,
              DestinationFile
            );
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });

    function getPresignedUrl(apiKey, localFile) {
      return new Promise((resolve) => {
        // Prepare request to `Get Presigned URL` API endpoint
        let queryPath = `/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${path.basename(
          SourceFile
        )}`;
        let reqOptions = {
          host: "api.pdf.co",
          path: encodeURI(queryPath),
          headers: { "x-api-key": CONVERTER_API_KEY },
        };
        // Send request
        https
          .get(reqOptions, (response) => {
            response.on("data", (d) => {
              let data = JSON.parse(d);
              if (data.error == false) {
                // Return presigned url we received
                resolve([data.presignedUrl, data.url]);
              } else {
                // Service reported error
                console.log("getPresignedUrl(): " + data.message);
              }
            });
          })
          .on("error", (e) => {
            // Request error
            console.log("getPresignedUrl(): " + e);
          });
      });
    }

    function uploadFile(apiKey, localFile, uploadUrl) {
      return new Promise((resolve) => {
        fs.readFile(SourceFile, (err, data) => {
          request(
            {
              method: "PUT",
              url: uploadUrl,
              body: data,
              headers: {
                "Content-Type": "application/octet-stream",
              },
            },
            (err, res, body) => {
              if (!err) {
                resolve();
              } else {
                console.log("uploadFile() request error: " + e);
              }
            }
          );
        });
      });
    }

    function convertDocToPdf(apiKey, uploadedFileUrl, destinationFile) {
      // Prepare URL for `DOC To PDF` API call
      let queryPath = `/v1/pdf/convert/from/doc`;

      // JSON payload for api request
      var jsonPayload = JSON.stringify({
        name: path.basename(destinationFile),
        url: uploadedFileUrl,
      });

      var reqOptions = {
        host: "api.pdf.co",
        method: "POST",
        path: queryPath,
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(jsonPayload, "utf8"),
        },
      };

      // Send request
      var postRequest = https
        .request(reqOptions, (response) => {
          response.on("data", (d) => {
            response.setEncoding("utf8");
            // Parse JSON response
            let data = JSON.parse(d);
            if (data.error == false) {
              // Download PDF file
              var file = fs.createWriteStream(destinationFile);
              https.get(data.url, (response2) => {
                response2.pipe(file).on("close", () => {
                  console.log(
                    `Generated PDF file saved as "${destinationFile}" file.`
                  );
                  return res
                    .status(201)
                    .send({ message: "file converted successfully" });
                });
              });
            } else {
              // Service reported error
              console.log("readBarcodes(): " + data.message);
            }
          });
        })
        .on("error", (e) => {
          // Request error
          console.log("readBarcodes(): " + e);
        });

      // Write request data
      postRequest.write(jsonPayload);
      postRequest.end();
    }
  } catch (err) {
    res.send({ message: "failed to convert the file" });
  }
};
