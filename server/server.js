const express = require("express");
const dotenv = require("dotenv");
const db = require("./database/db");
const userRouter = require("./routes/users.routes");
const chatRouter = require("./routes/chats.routes");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const { getUser } = require("./controllers/users.controller");
const crypto = require("crypto");
const https = require("https");
const fs = require("fs");
const path = require("path");
dotenv.config("./.env");

const app = express();

let server;
if (process.env.NODE_ENV === "production") {
  server = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, "certificates", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "certificates", "cert.pem")),
    },
    app
  );
}
else{
  server = http.createServer(app);
}

let onlineUsers = [];

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the database");
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", userRouter);
app.use("/api/v1", chatRouter);

app.get("/",(req,res)=>{
  res.send("Hello")
})

const port = process.env.PORT || 3000;

// Handling socket io server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
    db.query("USE chatdb");
    db.query("SELECT id FROM users WHERE socketId = ?", [socket.id], (error, results) => {
      if (error) {
        console.log(error);
      } else {
        const user = Object.assign({}, results[0]);
        onlineUsers.splice(onlineUsers.indexOf(user.id), 1);
        io.emit("status", onlineUsers);
      }
    });
  });

  socket.on("make-room", (msg) => {
    console.log("Room request: ", msg);
    if (msg.user1.split("@")[0].length > msg.user2.split("@")[0].length) {
      let roomname = msg.user1.split("@")[0] + msg.user2.split("@")[0];
      // console.log("Room name: ", roomname);
      socket.join(roomname);
      io.emit("made-room", roomname);
    }
    else{
      let roomname = msg.user2.split("@")[0] + msg.user1.split("@")[0];
      // console.log("Room name: ", roomname);
      socket.join(roomname);
      io.emit("made-room", roomname);
    }
  });

  socket.on("send-message", (msg) => {
    // console.log("Message: ", msg.message);
    // console.log(msg.recipaent.id);  
    // const recipaent = getUser(msg.recipaent.id);
    // console.log("Recipient: ", recipaent);
    let recipaentSocketId = null;
    db.query("USE chatdb");
    db.query("SELECT * FROM users WHERE id = ?", [msg?.recipaent?.id], (error, results) => {
      if (error) {
        console.log(error);
        // return null;
      } else {
        // console.log(Object.assign({}, results[0]))
        const user = Object.assign({}, results[0]);
        console.log(user.socketId);
        recipaentSocketId = user.socketId;
        // return user.socketId;
        io.to(recipaentSocketId).emit("receive-message", msg);
      }
    });
  });

  socket.on("status",(data)=>{
    console.log(data)
    onlineUsers.push(data)
    io.emit("status",onlineUsers)
  })
});

// Handling routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = { io };
