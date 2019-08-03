const express = require("express");
const connectDB = require("./config/db");
const app = express();

// Connect Database
connectDB();

app.get("/", (req, res) => res.send("Api Running"));
// if deploy on heroku get port if local then 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
