const jwt = require('jsonwebtoken');
const pool = require('../database/db');

const verifySocket = async (socket, next) => {
  let refreshToken;
  refreshToken = socket.handshake.auth?.token;
  refreshToken = socket.handshake.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('refreshToken='))?.split('=')[1] || refreshToken;

  console.log(refreshToken);
  let connection;

  if (!refreshToken) {
    return next(new Error("Access Denied"));
  }

  try {
    const { id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    connection = await pool.promise().getConnection();
    await connection.query('USE chatdb');
    
    const [results] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return next(new Error("User not found"));
    }

    socket.userID = results[0].id;
    next();
  } catch (error) {
    console.error('Error in verify middleware:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error("Invalid Token"));
    }
    return next(new Error("Internal server error"));
  } finally {
    if (connection) connection.release();
  }
};

module.exports = verifySocket;