const jwt = require('jsonwebtoken');
const pool = require('../database/db');

const verify = async (req, res, next) => {
  let refreshToken;
  const AuthHeader = req.headers['authorization'];
  refreshToken = AuthHeader && AuthHeader.split(' ')[1];
  refreshToken = req.cookies.refreshToken || refreshToken;
  // console.log(refreshToken);
  let connection;

  if (!refreshToken) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const { id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    connection = await pool.promise().getConnection();
    await connection.query('USE chatdb');
    
    const [results] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = results[0];
    next();
  } catch (error) {
    console.error('Error in verify middleware:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = verify;