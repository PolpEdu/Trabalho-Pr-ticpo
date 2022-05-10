const { Client } = require('pg')

const client = new Client({
    host: "localhost",
    user: process.env.DBUSER,
    port: 5432,
    password: process.env.DBUSER,
    database: "trabalhoBD"
})

module.exports = client