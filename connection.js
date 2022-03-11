const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    user: "aulaspl",
    port: 5432,
    password: process.env.DBPASS,
    database: "TrabalhoBD"
})

module.exports = client