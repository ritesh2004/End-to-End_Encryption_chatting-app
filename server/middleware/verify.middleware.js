const jwt = require('jsonwebtoken');
const db = require('../database/db');

const verify = (req, res, next) => {
    const {refreshToken} = req.cookies;
    // console.log(refreshToken);
    if (!refreshToken) return res.status(401).json({message: "Access Denied"});
    if (refreshToken){
        try {
            const {id} = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            db.query('USE chatdb');
            db.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
                if (error) {
                    return res.status(500).json({message: error.message});
                } else {
                    const userObj = Object.assign({}, results[0]);
                    console.log(userObj);
                    req.user = userObj;
                    next();
                }
            });
        } catch (error) {
            res.status(400).json({message: "Invalid Token"});
        }
    }
}


module.exports = verify;