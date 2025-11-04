const express = require("express");
const dotenv = require("dotenv");
const pool = require("./database/db");
const userRouter = require("./routes/users.routes");
const chatRouter = require("./routes/chats.routes");
const notificationRouter = require("./routes/notification.routes");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const { getUser } = require("./controllers/users.controller");
const crypto = require("crypto");
const https = require("https");
const fs = require("fs");
const path = require("path");
const verifySocket = require("./middleware/verifySocket.middleware");
const { storeMessage } = require("./utils/storeMessage");
const fetchUsers = require("./utils/sendAllUsers");
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
else {
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

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", userRouter);
app.use("/api/v1", chatRouter);
app.use("/api/v1", notificationRouter);

app.get("/", (req, res) => {
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

io.use(verifySocket);

let userMap = new Map(); // Map to store userID and socketID pairs

io.on("connection", async (socket) => {
  console.log("User connected: ", socket.id);
  let connection;

  userMap.set(String(socket.userID), socket.id);

  try {
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    await connection.query(
      "UPDATE users SET socketId = ? WHERE id = ?",
      [socket.id, socket.userID]
    );
    if (!onlineUsers.includes(String(socket.userID))) {
      onlineUsers.push(String(socket.userID));
    }
    console.log("Onlined Users: ", onlineUsers);
  } catch (error) {
    console.error('Error in connection handler:', error);
  }
  finally {
    if (connection) connection.release();
  }

  socket.emit("users", await fetchUsers(socket.userID));

  io.emit("status", onlineUsers);

  socket.broadcast.emit("user-connected", { id: socket.userID });

  socket.on("disconnect", async () => {
    console.log("User disconnected: ", socket.id);
    try {
      userMap.delete(String(socket.userID));
      connection = await pool.promise().getConnection();
      await connection.query("USE chatdb");

      const [results] = await connection.query(
        "SELECT id FROM users WHERE socketId = ?",
        [socket.id]
      );

      if (results.length > 0) {
        const userId = results[0].id;
        onlineUsers = onlineUsers.filter(id => id !== String(userId));
        await connection.query(
          "UPDATE users SET lastSeen = ? WHERE id = ?",
          [new Date(), userId]
        );
        console.log("Onlined Users: ", onlineUsers);
        io.emit("status", onlineUsers);
      }
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // socket.on("make-room", (msg) => {
  //   console.log("Room request: ", msg);
  //   const user1 = msg.user1.split("@")[0];
  //   const user2 = msg.user2.split("@")[0];
  //   const roomname = user1.length > user2.length
  //     ? user1 + user2
  //     : user2 + user1;

  //   socket.join(roomname);
  //   io.emit("made-room", roomname);
  // });

  socket.on("send-message", async ({ message, to }) => {
    // console.log("Message: ", message);
    let connection;
    try {
      connection = await pool.promise().getConnection();
      const result = await storeMessage(socket.userID, to?.id, message);
      io.to(socket.id).emit("message-sent", {chatTime: result?.chatTime});
      const recipientSocketId = userMap.get(String(to.id));
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive-message", {message, to, from: socket.userID, chatTime: result?.chatTime});
      }
    } catch (error) {
      console.error('Error in send-message handler:', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // socket.on("status", (data) => {
  //   console.log(data);
  //   if (!onlineUsers.includes(data)) {
  //     onlineUsers.push(data);
  //   }
  //   console.log(onlineUsers);
  //   io.emit("status", onlineUsers);
  // });
});

// Handling routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = { io };
