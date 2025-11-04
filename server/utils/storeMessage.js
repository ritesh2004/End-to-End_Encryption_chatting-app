const pool = require("../database/db");

function getTimezoneOffsetString() {
  const offset = -new Date().getTimezoneOffset(); // in minutes
  const sign = offset >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

const storeMessage = async (senderId, receiverId, message) => {
  let connection;
  try {
    if (!senderId || !receiverId || !message) {
      throw new Error("All fields are required");
    }
    // const offsetString = getTimezoneOffsetString();

    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");

    const result = await connection.query(
      "INSERT INTO chats (from_id, to_id, message) VALUES (?, ?, ?)",
      [senderId, receiverId, message]
    );

    return { message: "Chat created successfully", chatTime: result[0].message_time };
  } catch (error) {
    console.error('Error in createChat:', error);
    throw new Error("Internal server error");
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { storeMessage };