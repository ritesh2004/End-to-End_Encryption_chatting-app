const db = require("../database/db");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");
const verify = require("../middleware/verify.middleware");

const createUser = (req, res) => {
  try {
    const { name, email, provider, photoURL } = req.body;
    let resultObj;
    if (!name || !email || !provider || !photoURL) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    db.query("USE chatdb");
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: error.message });
        } else if (results.length > 0) {
          login(req, res);
        } else {
          const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
          db.query("USE chatdb");
          db.query(
            "INSERT INTO users(fullname,email,provider,createdAt,photoURL) VALUES(?,?,?,?,?)",
            [name, email, provider, timestamp, photoURL],
            (error, results) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ message: error.message });
              } else {
                // console.log(results);
                db.query(
                  "SELECT * FROM users WHERE email = ?",
                  [email],
                  (error, results) => {
                    if (error) {
                      console.log(error);
                      return res.status(500).json({ message: error.message });
                    } else {
                      resultObj = Object.assign({}, results[0]);
                      return res
                        .status(200)
                        .json({
                          message: "User created successfully",
                          user: resultObj,
                        });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = (req, res) => {
  try {
    console.log(req.body);
    const { email, provider } = req.body;
    let resultObj;
    if (!email || !provider) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    db.query("USE chatdb");
    db.query(
      "SELECT * FROM users WHERE email = ? AND provider = ?",
      [email, provider],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: error.message });
        } else {
          if (results.length > 0) {
            resultObj = Object.assign({}, results[0]);
            const accessToken = generateAccessToken(resultObj);
            const refreshToken = generateRefreshToken(resultObj);

            return res
              .status(200)
              .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
              })
              .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 60 * 15 * 1000, // 15 minutes
              })
              .json({ message: "Login successful", user: resultObj });
          } else {
            return res.status(404).json({ message: "User not found" });
          }
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyMe = (req, res) => {
  try {
    return res.status(200).json({ message: "User verified", user: req.user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = (req, res) => {
  try {
    db.query("USE chatdb");
    db.query("SELECT * FROM users", (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
      } else {
        let users = [];
        // const resultObj = Object.assign({}, results[0]);
        // console.log(results);
        // console.log(results.length);
        for (let i = 0; i < results.length; i++) {
          users.push(Object.assign({}, results[i]));
        }
        return res
          .status(200)
          .json({ message: "Users retrieved successfully", users });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSocketId = (req, res) => {
  try {
    const { socketId } = req.body;
    const { id } = req.user;
    db.query("USE chatdb");
    db.query(
      "UPDATE users SET socketId = ? WHERE id = ?",
      [socketId, id],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: error.message });
        } else {
          return res
            .status(200)
            .json({ message: "Socket ID updated successfully" });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePublicKey = (req, res) => {
  try {
    const { publickey } = req.body;
    // console.log(publickey);
    const { id } = req.user;
    db.query("USE chatdb");
    db.query(
      "UPDATE users SET secret = ? WHERE id = ?",
      [publickey, id],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: error.message });
        } else {
          return res
            .status(200)
            .json({ message: "Publick Key updated successfully" });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUser = (id) => {
  try {
    db.query("USE chatdb");
    db.query("SELECT * FROM users WHERE id = ?", [id], (error, results) => {
      if (error) {
        console.log(error);
        return null;
      } else {
        // console.log(Object.assign({}, results[0]))
        const user = Object.assign({}, results[0]);
        console.log(user.socketId);
        return user.socketId;
      }
    });
  } catch (error) {
    return null;
  }
}

const getUserSecret = (req,res) => {
  try {
    const { id } = req.params;
    db.query("USE chatdb");
    db.query("SELECT secret,email FROM users WHERE id = ?", [id], (error, results) => {
      if (error) {
        console.log(error);
        return null;
      } else {
        // console.log(Object.assign({}, results[0]))
        const user = Object.assign({}, results[0]);
        return res
          .status(200)
          .json({ message: "Secret retrieved successfully", user });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createUser,
  login,
  verifyMe,
  getAllUsers,
  updateSocketId,
  getUser,
  updatePublicKey,
  getUserSecret,
};
