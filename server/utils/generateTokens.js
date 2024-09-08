const jwt = require('jsonwebtoken');
const db = require('../database/db');

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}

const generateRefreshToken = (user) => {
    return jwt.sign({
        id : user.id,
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

const getAccessToken = (refresh_token) => {
    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return null;
        } else {
            db.query('USE chatdb');
            db.query('SELECT * FROM users WHERE id = ?', [user.id], (error, results) => {
                if (error) {
                    return null;
                } else {
                    let resultObj = Object.assign({}, results[0]);
                    return generateAccessToken(resultObj);
                }
            });
        }
    });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    getAccessToken
}