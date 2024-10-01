const db = require("../database/db");

const createChat = (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
        db.query("USE chatdb");
        db.query(
            "INSERT INTO chats (from_id, to_id, message, message_time) VALUES (?, ?, ?, ?)",
            [senderId, receiverId, message, timestamp],
            (error, results) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: error.message });
                } else {
                    return res
                        .status(200)
                        .json({ message: "Chat created successfully" });
                }
            }
        );
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getChats = (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        db.query("USE chatdb");
        db.query(
            "SELECT * FROM chats WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)",
            [senderId, receiverId, receiverId, senderId],
            (error, results) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: error.message });
                } else {
                    let chats = [];
                    for (let i = 0; i < results.length; i++) {
                        chats.push(Object.assign({}, results[i]));
                    }
                    return res.status(200).json({ chats });
                }
            }
        );
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createChat,
    getChats,
}