const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    keepAliveInitialDelay: 300000,
    enableKeepAlive: true,
    ssl : {
        rejectUnauthorized : false
    }
})



module.exports = pool;