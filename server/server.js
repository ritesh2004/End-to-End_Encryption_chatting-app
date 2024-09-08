const express = require("express");
const dotenv = require("dotenv");
const db = require("./database/db");
const userRouter = require("./routes/users.routes");
const cookieParser = require("cookie-parser");
dotenv.config("./.env");

const app = express();

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the database");
});

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", userRouter);

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
