const pool = require("../database/db");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");
const verify = require("../middleware/verify.middleware");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  let connection;
  try {
    const { username, email, password, photoURL, publicKey, privateKey } = req.body;

    if (!username || !email || !password || !photoURL || !publicKey || !privateKey) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");

    const [existingUsers] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return login(req, res);
    }

    const encryptedPassword = bcrypt.hashSync(password, 10);
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

    await connection.query(
      "INSERT INTO users(username,password,email,createdAt,photoURL,publicKey,privateKey) VALUES(?,?,?,?,?,?,?)",
      [username, encryptedPassword, email, timestamp, photoURL, publicKey, privateKey]
    );

    const [newUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    return res.status(200).json({
      message: "User created successfully",
      user: newUser[0],
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const login = async (req, res) => {
  let connection;
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");

    const [results] = await connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [user, user]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, results[0].password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const { id, username, email, photoURL, socketId, publicKey, privateKey } = results[0];
    const userData = { id, username, email, photoURL, socketId, publicKey, privateKey };

    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 15 * 1000, // 15 minutes
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true
      })
      .json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const checkUsernameEmail = async (req, res) => {
  let connection;
  try {
    const { username, email } = req.body;
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    const [results] = await connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (results.length > 0) {
      return res.status(400).json({ message: "Username or email already exists" });
    } else {
      return res.status(200).json({ message: "Username and email are available" });
    }
  } catch (error) {
    console.error('Error in checkUsernameEmail:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const verifyMe = (req, res) => {
  try {
    return res.status(200).json({ message: "User verified", user: req.user });
  } catch (error) {
    console.error('Error in verifyMe:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  let connection;
  try {
    const user = req.user;
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    const [results] = await connection.query(
      "SELECT id, username, email, socketId, publicKey, photoURL, lastseen FROM users WHERE id <> ?",
      [user?.id]
    );

    return res.status(200).json({ 
      message: "Users retrieved successfully", 
      users: results 
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const updateSocketId = async (req, res) => {
  let connection;
  try {
    const { socketId } = req.body;
    const { id } = req.user;
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    await connection.query(
      "UPDATE users SET socketId = ? WHERE id = ?",
      [socketId, id]
    );

    return res.status(200).json({ message: "Socket ID updated successfully" });
  } catch (error) {
    console.error('Error in updateSocketId:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const updatePublicKey = async (req, res) => {
  let connection;
  try {
    const { publickey } = req.body;
    const { id } = req.user;
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    await connection.query(
      "UPDATE users SET publicKey = ? WHERE id = ?",
      [publickey, id]
    );

    return res.status(200).json({ message: "Public Key updated successfully" });
  } catch (error) {
    console.error('Error in updatePublicKey:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const getUser = async (id) => {
  let connection;
  try {
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    const [results] = await connection.query(
      "SELECT * FROM users WHERE id = ?", 
      [id]
    );

    if (results.length === 0) {
      return null;
    }

    return results[0].socketId;
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  } finally {
    if (connection) connection.release();
  }
};

const getUserSecret = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    const [results] = await connection.query(
      "SELECT publicKey, email FROM users WHERE id = ?", 
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      message: "Secret retrieved successfully", 
      user: results[0] 
    });
  } catch (error) {
    console.error('Error in getUserSecret:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const editProfile = async (req, res) => {
  let connection;
  try {
    const { id } = req.user;
    const { username, email, photoURL } = req.body;
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    await connection.query(
      "UPDATE users SET username = ?, email = ?, photoURL = ? WHERE id = ?",
      [username, email, photoURL, id]
    );

    return res.status(200).json({ 
      message: "Profile updated successfully", 
      user: { ...req.user, username, email, photoURL } 
    });
  } catch (error) {
    console.error('Error in editProfile:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const editLastmsg = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { lastmsg } = req.body;
    
    connection = await pool.promise().getConnection();
    await connection.query("USE chatdb");
    
    await connection.query(
      "UPDATE users SET lastmsg = ? WHERE id = ?",
      [lastmsg, id]
    );

    return res.status(200).json({ message: "Last message updated successfully" });
  } catch (error) {
    console.error('Error in editLastmsg:', error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

const logout = (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("refreshToken",{
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true
      })
      .clearCookie("accessToken",{
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true
      })
      .json({ message: "Logout successful" });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  login,
  verifyMe,
  getAllUsers,
  updateSocketId,
  getUser,
  updatePublicKey,
  getUserSecret,
  editProfile,
  editLastmsg,
  logout,
  checkUsernameEmail
};