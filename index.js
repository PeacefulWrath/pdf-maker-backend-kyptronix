const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileRoutes = require("./routes/fileRoutes");
const connectDB = require("./config/db");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/file/", fileRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
