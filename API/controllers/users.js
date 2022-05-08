const client = require('../connection.js')
const bcrypt = require('bcryptjs');

exports.signup = (req, res) => {

    const {
        nif,
        username,
        email,
        password,
    } = req.body


    //validate nif
    try {
        if (nif.toString().length !== 9 || nif.toString().match(/^[0-9]+$/) === null) {
            return res.status(400).json({
                status_code: 400,
                errors: "NIF must be 9 digits long! From"
            })
        }
        //validate email
        else if (email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) === null) {
            return res.status(400).json({
                status_code: 400,
                errors: "Email must be valid!"
            })
        } else if (password.length < 3) {
            return res.status(400).json({
                status_code: 400,
                errors: "Password must be at least 3 characters long!"
            });
        }
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
    console.log(nif, email)
    /*
    Server está a dar mal com este body, se vires os logs ele está a cagar no igual
    {
    "nif": 123456709,
    "username": "dsada",
    "email": "edujgnune@gmail.com",
    "password": "sad"
}*/
    // check if user exists using email or nif. Select from the users tables the user with the same email or nif
    client.query('SELECT * FROM users WHERE nif = $1 OR email = $2', [nif, email], (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).json({
                status_code: 500,
                errors: err.message,
            });
        }
        if (result.rows.length > 0) {
            console.log("User already exists!", result.rows)
            res.status(400).json({
                status_code: 400,
                errors: "User already exists!",
            });
        }
        else {
            if (nif) {
                console.log("uyo")
                return res.status(400).json({
                    status_code: 400,
                    errors: "User already exists!",
                });
            } else {
                console.log("asdd")
                // salt and hash the password
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                //get current time
                const now = new Date();


                // insert the user into the database
                client.query('INSERT INTO users (nif, username, email, password, created_on, last_login) VALUES ($1, $2, $3, $4, $5, $6)', [nif, username, email, hash, now, null],
                    (err, result) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).json({
                                status_code: 500,
                                message: err.message,
                            });
                        }
                        return res.status(200).json({
                            status_code: 200,
                            message: "User registered successfully!",
                            results: result.rows[0].user_id
                        });
                    });
            }
        }
    })

}

exports.login = (req, res) => {
    const { email, password } = req.body;


}