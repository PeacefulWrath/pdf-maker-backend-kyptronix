const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const templateRoutes = require("./routes/templateRoutes");


dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;


app.use("/api/template", templateRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
