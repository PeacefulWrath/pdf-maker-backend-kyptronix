const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const mcqRoutes=require("./routes/mcqRoutes")
const quizRoutes=require("./routes/quizRoutes")
const invoiceRoutes=require("./routes/invoiceRoutes")
const userRoutes=require("./routes/userRoutes")
const purchaseOrderRoutes=require("./routes/purchaseOrderRoutes")
const faqRoutes=require("./routes/faqRoutes")
const galleryRoutes=require("./routes/galleryRoutes")
const categoryRoutes=require("./routes/categoryRoutes")
const productRoutes=require("./routes/productRoutes")
const  trainingModuleRoutes=require("./routes/trainingModuleRoutes")
const  cusRoutes=require("./routes/chooseUsRoutes")
const testimonialRoutes=require("./routes/testimonialRoutes")
const serviceRoutes=require("./routes/serviceRoutes")
const partnerRoutes=require("./routes/partnerRoutes")
const ourMissionRoutes=require("./routes/ourMission")
const ourVisionRoutes=require("./routes/ourVision")
const aboutUsRoutes=require("./routes/aboutUsRoutes")
const callUsRoutes=require("./routes/callUsRoutes")
const emailUsRoutes=require("./routes/emailUsRoutes")
const orderRoutes=require("./routes/orderRoutes")

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

const stripe=require("stripe")(process.env.SECRET_STRIPE_KEY)

app.use("/api/template", fileRoutes);
app.use("/api/mcq-template", mcqRoutes);
app.use("/api/quiz-template", quizRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/user", userRoutes);
app.use("/api/purchase-order", purchaseOrderRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/training-module", trainingModuleRoutes);
app.use("/api/choose-us", cusRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/service",serviceRoutes);
app.use("/api/partner",partnerRoutes);
app.use("/api/our-mission",ourMissionRoutes);
app.use("/api/our-vision",ourVisionRoutes);
app.use("/api/about-us",aboutUsRoutes);
app.use("/api/call-us",callUsRoutes);
app.use("/api/email-us",emailUsRoutes);
app.use("/api/order",orderRoutes);


//payment

app.post("/checkout",async(req,res)=>{
  try{
    const session=await stripe.checkout.sessions.create({
      payment_method_types:['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: req.body.product_name,
            },
            unit_amount: req.body.amount*100,
          },
          quantity: req.body.quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.STRIPE_SUCCESS_URL}`,
      cancel_url: `${process.env.STRIPE_FAILURE_URL}`,
    })

    if(session){
      res.json({success:"yes", session: session, message:"session created" });
    }

  }catch(error){
          res.status(400).json({success:"no",message:error.message})
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
