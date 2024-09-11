const { io } = require("../server");

io.on("connection", (socket) => {
  console.log("User connected: ",socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected: ",socket.id);
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});
