const client = require("./connection.js");
const bcrypt = require("bcryptjs");

function insertfakeusers() {

    //first insert user
    const query_insert_user = 'INSERT INTO users (nif, username, email, password, created_on) VALUES ($1, $2, $3, $4, $5) RETURNING nif, username, email, password, created_on';




    for (let i = 0; i < 3; i++) {
        //generate a integer that contains i 9 times
        for (let j = 0; j < 9; j++) {
            var nif = i * 9 + j;
        }
        console.log(nif);
        const password = "sad" + i;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const values = [
            nif,
            "vendedor" + i,
            "vendedor" + i + "@vendedor.com",
            hash, //password: sad
            new Date(),
        ];

        //insert into vendedores
        client.query(query_insert_user, values, (err, result) => {
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
            client.query("INSERT INTO vendedor (users_nif) VALUES ($1)", [values[0]], (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("User inserted:\n" + "nif: " + nif + "\nusername: " + username + "\nemail: " + email + "\npassword: " + password + "\ncreated_on: " + created_on + "\n\n\n");
            }
            );
        });
    }
}

module.exports = insertfakeusers;
