const pool = require("../database/db");

const createChat = async (req, res) => {
  let connection;
  try {
    const { senderId, receiverId, message } = req.body;
    
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    await connection.query(
      "INSERT INTO chats (from_id, to_id, message, message_time) VALUES (?, ?, ?, ?)",
      [senderId, receiverId, message, timestamp]
    );
    
    return res.status(200).json({ message: "Chat created successfully" });
  } catch (error) {
    console.error('Error in createChat:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const getChats = async (req, res) => {
  let connection;
  try {
    const { senderId, receiverId } = req.body;
    const { after } = req.query;
    console.log(req.query)
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let afterDate = after ? new Date(after) : new Date(0);
    afterDate = afterDate.toISOString().slice(0, 19).replace("T", " ")
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    console.log(afterDate)
    const [results] = await connection.query(
      "SELECT * FROM chats WHERE ((from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)) AND message_time > ? ORDER BY message_time ASC",
      [senderId, receiverId, receiverId, senderId, afterDate]
    );
    
    return res.status(200).json({ chats: results });
  } catch (error) {
    console.error('Error in getChats:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const getAllChatsByID = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.promise().getConnection();

    await connection.query("USE chatdb");
    const [results] = await connection.query(
      "SELECT * FROM chats WHERE from_id = ? OR to_id = ?",
      [id, id]
    );
    return res.status(200).json({ chats: results });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  createChat,
  getChats,
  getAllChatsByID
};