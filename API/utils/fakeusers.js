const client = require("./connection.js");
const bcrypt = require("bcryptjs");

function insertfakedata() {

    //first insert super user
    const query_superuser = 'INSERT INTO users (nif, username, email, password, created_on) VALUES ($1, $2, $3, $4, $5) RETURNING nif, username, email, password, created_on'

    const password = "sad";

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const values = [
        123456789,
        "superuser",
        "admin@admin.com",
        hash, //sad
        new Date(),
    ];

    //check if user with nif 123456789 already exists
    client.query(`SELECT CASE WHEN EXISTS(SELECT 1 FROM users WHERE nif = '${values[0]}') THEN true ELSE false END AS exists`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        if (result.rows[0].exists) {
            console.log("Super user already exists.");
            return;
        } else {
            console.log("Default super user doesnt exist. Inserting...");
            client.query(query_superuser, values, (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                const {
                    nif,
                    username,
                    email,
                    pass_hashed,
                    created_on,
                } = result.rows[0];

                client.query("INSERT INTO administrador (users_nif) VALUES ($1)", [values[0]], (err, result) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("Super user inserted:\n" + "nif: " + nif + "\nusername: " + username + "\nemail: " + email + "\npassword: " + password + "\ncreated_on: " + created_on + "\n\n\n");
                });


            });

        }
    });


}

module.exports = insertfakedata;
