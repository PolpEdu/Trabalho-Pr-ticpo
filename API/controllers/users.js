const client = require('../connection.js')
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
    /*
    {
    "nif": 123456789, //9 digitos
    "username": "dsada", // 50 chars
    "email": "edujgnunes@gmail.com", // email valido
    "password": "sad", // >= 3 chars
    "type": "comprador" // comprador ou vendedor ou administrador
    }
    */

    const {
        nif,
        username,
        email,
        password,
        type,
    } = req.body

    //check if each field exits first
    if (!nif || !username || !email || !password || !type) {
        return res.status(400).json({
            status: 400,
            errors: "Missing fields.",
        });
    }


    //validate nif
    try {
        if (type !== "comprador" && type !== "vendedor" && type !== "administrador") {
            return res.status(400).json({
                status: 400,
                errors: "User type invalid. It must be 'comprador', 'vendedor' or 'administrador'"
            })
        }
        else if (nif.toString().length !== 9 || nif.toString().match(/^[0-9]+$/) === null) {
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
        } else if (username.length > 50 || username.length < 3) {
            return res.status(400).json({
                status_code: 400,
                errors: "Username must be between 3 and 50 characters long!"
            });
        }
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }

    //TODO: fazer tudo num query aqui em baixo.

    // check if user exists using email or nif. Select from the users tables the user with the same email or nif
    client.query('SELECT * FROM users WHERE nif = $1 OR email = $2::text OR username = $3::text', [nif, email, username], (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                status_code: 500,
                errors: err.message,
            });
        }
        console.log(result.rows)
        if (result.rows.length > 0) {
            console.log("User already exists!")
            return res.status(400).json({
                status_code: 400,
                errors: "User already exists!",
            });
        }
        else {
            // salt and hash the password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            //get current time
            const now = new Date();


            // insert the user into the database
            client.query(
                'INSERT INTO users (nif, username, email, password, created_on, last_login) VALUES ($1, $2, $3, $4, $5, $6) RETURNING nif, username, email'
                , [nif, username, email, hash, now, null],
                (err, result) => {
                    console.log(nif, username, email, hash, now, null)
                    if (err) {
                        console.log(err)
                        return res.status(500).json({
                            status_code: 500,
                            message: err.message,
                        });
                    }
                    const user = result.rows[0];
                    console.log(user)
                    return res.status(200).json({
                        status_code: 200,
                        message: "User registered successfully!",
                        results: {
                            nif: user.nif,
                            username: user.username,
                            email: user.email,
                        }
                    });
                });
        }
    })
}

exports.login = (req, res) => {
    const { username, password } = req.body;

    /* example of request body
    {
        "username": "something",
        "password": "something_secret"
    }
    */

    //check if each field exits first
    if (!username || !password) {
        return res.status(400).json({
            status_code: 400,
            errors: "Missing fields.",
        });
    }

    // check if user exists with email
    /*
        SELECT * FROM users WHERE email = $1::text
        UPDATE users SET last_login = $1 WHERE nif = $2 RETURNING nif, username, email
    */
    client.query('SELECT * FROM users WHERE email = $1::text', [email], (err, result) => {
        console.log(result)

        if (err) {
            console.log(err)
            return res.status(500).json({
                status_code: 500,
                errors: err.message,
            });
        }
        if (result.rows.length === 0) {
            console.log("User does not exist!")
            return res.status(400).json({
                status_code: 400,
                errors: "User does not exist!",
            });
        } else {
            // check if password is correct
            const user = result.rows[0];
            bcrypt.compare(password, user.password).then(isValid => {
                if (isValid) {
                    const now = new Date();

                    jwt.sign({
                        nif: user.nif,
                        username: user.username,
                        email: user.email,
                    }, process.env.JWT_SECRET, { expiresIn: '1h' },
                        (err, token) => {
                            if (err) {
                                console.log(err)
                                return res.status(500).json({
                                    status_code: 500,
                                    errors: err.message,
                                });
                            }
                            console.log(token)

                            // update last login
                            client.query(
                                'UPDATE users SET last_login = $1 WHERE nif = $2 RETURNING nif'
                                , [now, user.nif],
                                (err, result) => {
                                    if (err) {
                                        console.log(err)
                                        return res.status(500).json({
                                            status_code: 500,
                                            errors: err.message,
                                        });
                                    }
                                    console.log(result.rows)
                                    return res.status(200).json({
                                        status_code: 200,
                                        message: "User logged in successfully!",
                                        results: {
                                            token: token,
                                            user: {
                                                nif: user.nif,
                                                username: user.username,
                                                email: user.email,
                                                last_login: now

                                            }
                                        }
                                    });
                                }
                            );
                        }
                    );
                } else {
                    return res.status(400).json({
                        status_code: 400,
                        errors: "Password is incorrect!",
                    });
                }
            });
        }
    })
}