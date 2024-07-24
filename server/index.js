const express = require("express");
const cors = require("cors");
const router = require("./src/route");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
