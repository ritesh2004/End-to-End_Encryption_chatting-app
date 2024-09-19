const { io } = require("../server");

io.on("connection", (socket) => {
  console.log("User connected: ",socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected: ",socket.id);
  });

  socket.on("make-room", (msg) => {
    console.log("Room request: ",msg);
    let roomname = msg.user1 + msg.user2;
    console.log("Room name: ",roomname);
    io.emit("made-room", roomname);
  });
});
