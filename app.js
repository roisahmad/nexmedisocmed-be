// app.js
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize } = require("./config/database");
const routes = require("./routes");

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/", routes);

app.get("/", (req, res) => {
  res.send("API Service for E-Office");
});

sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
