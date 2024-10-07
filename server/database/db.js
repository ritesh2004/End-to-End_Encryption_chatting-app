const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    ssl : {
        rejectUnauthorized : false
    }
})



module.exports = db;