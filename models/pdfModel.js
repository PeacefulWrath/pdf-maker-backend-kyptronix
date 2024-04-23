const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    
    pdfs: [{
      file_name: {
        type: String,
      },
      url:{
      type: String,
      },
      watermark:{
        type: Boolean,
       
        
      },
      top_left_logo:{
        type: Boolean,
     
      },
      bottom_right_page_no:{
        type: Boolean,
   
      },
      pdf_downloadable:{
        type: Boolean,
        
      }
    }],
   
  },
  { timestamps: true }
);

const PdfModel = mongoose.model("PdfModel", pdfSchema);

module.exports = PdfModel;
