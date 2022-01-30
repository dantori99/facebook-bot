require("dotenv").config();

module.exports = {
    development = {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
    }
}