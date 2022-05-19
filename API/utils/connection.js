const { Client } = require('pg')

const client = new Client({
    host: "localhost",
    user: process.env.DBUSER,
    port: 5432,
    password: process.env.DBPASS,
    database: process.env.NOMEBASEDADOS
})

module.exports = client