const { Router } = require("express");
const verify = require("../middleware/verify.middleware");
const { createChat, getChats, getAllChatsByID } = require("../controllers/chats.controller");

const chatRouter = Router();

chatRouter.post("/chat/create", verify, createChat);

chatRouter.post("/chat/get", verify, getChats);

chatRouter.get("/chat/get/:id", verify, getAllChatsByID);

module.exports = chatRouter;