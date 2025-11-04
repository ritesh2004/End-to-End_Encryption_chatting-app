const pool = require('../database/db');

const fetchUsers = async (userID) => {
  let connection;
  try {
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    const [results] = await connection.query(
      "SELECT id, username, email, socketId, publicKey, photoURL, lastseen FROM users WHERE id <> ? ORDER BY lastseen DESC",
      [userID]
    );

    return { 
      message: "Users retrieved successfully", 
      users: results 
    };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return { message: "Internal server error" };
  } finally {
    if (connection) connection.release();
  }
};

module.exports = fetchUsers;