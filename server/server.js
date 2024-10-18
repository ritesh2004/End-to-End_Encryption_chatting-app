const express = require("express");
const dotenv = require("dotenv");
const pool = require("./database/db");
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

// db.connect((err) => {
//   if (err) {
//     throw err;
//   }
//   console.log("Connected to the database");
// });

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

  socket.on("disconnect", async () => {
    console.log("User disconnected: ", socket.id);
    let connection;
    try {
      connection = await pool.promise().getConnection();
      await connection.query("USE chatdb");
      
      const [results] = await connection.query(
        "SELECT id FROM users WHERE socketId = ?", 
        [socket.id]
      );
      
      if (results.length > 0) {
        const userId = results[0].id;
        onlineUsers = onlineUsers.filter(id => id !== userId);
        await connection.query(
          "UPDATE users SET lastSeen = ? WHERE id = ?", 
          [new Date(), userId]
        );
        console.log(onlineUsers);
        io.emit("status", onlineUsers);
      }
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    } finally {
      if (connection) connection.release();
    }
  });

  socket.on("make-room", (msg) => {
    console.log("Room request: ", msg);
    const user1 = msg.user1.split("@")[0];
    const user2 = msg.user2.split("@")[0];
    const roomname = user1.length > user2.length 
      ? user1 + user2 
      : user2 + user1;
    
    socket.join(roomname);
    io.emit("made-room", roomname);
  });

  socket.on("send-message", async (msg) => {
    let connection;
    try {
      connection = await pool.promise().getConnection();
      await connection.query("USE chatdb");
      
      const [results] = await connection.query(
        "SELECT socketId FROM users WHERE id = ?", 
        [msg?.recipaent?.id]
      );
      
      if (results.length > 0) {
        const recipientSocketId = results[0].socketId;
        io.to(recipientSocketId).emit("receive-message", msg);
      } else {
        console.log(`Recipient with id ${msg?.recipaent?.id} not found`);
      }
    } catch (error) {
      console.error('Error in send-message handler:', error);
    } finally {
      if (connection) connection.release();
    }
  });

  socket.on("status", (data) => {
    console.log(data);
    if (!onlineUsers.includes(data)) {
      onlineUsers.push(data);
    }
    console.log(onlineUsers);
    io.emit("status", onlineUsers);
  });
});

// Handling routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = { io };
