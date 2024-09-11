const express = require("express");
const dotenv = require("dotenv");
const db = require("./database/db");
const userRouter = require("./routes/users.routes");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
dotenv.config("./.env");

const app = express();

const server = http.createServer(app);

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the database");
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,  
  methods : ["GET", "POST"]
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", userRouter);

const port = process.env.PORT || 3000;

const io = new Server(server);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = { io };
