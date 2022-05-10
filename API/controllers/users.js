const client = require('../utils/connection.js')
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

//* Nota 1: */
// See issue: #1
// procedures: bue densidade
// queries simples (select)
//! fazer em algum lado uma procedure para mostrar que sei

//* Nota 2: */
// a ordem com que fazes selects interessam a nivel de performance  
//where if_user=63 and id_dist=50 and id_prov=1 
// o id_user reduz, o id_dist volta a reduzir, o id_prov da o return final.
//quanto mais indexado mais rápido o querie executa 


//* Nota 3: */
//não faz sentido fazer uma querie super complicadas para a bd quando aqui no node é apenas um for

exports.signup = async (req, res) => {
    /*
    {
    "nif": 123456789, //9 digitos
    "username": "dsada", // 50 chars
    "email": "edujgnunes@gmail.com", // email valido
    "password": "sad", // >= 3 chars
    "type": "comprador" // comprador ou vendedor ou administrador
    }
    */

    //check for jwt header
    const tokenheader = req.headers.authorization
    const {
        nif,
        username,
        email,
        password,
        type,
        morada
    } = req.body


    //check if each field exits first
    if (!nif || !username || !email || !password || !type) {

        return res.status(400).json({
            status: 400,
            errors: "Missing fields.\nFields Required: nif, username, email, password, type",
        });
    }



    //* Mod Validation:
    //validate token
    if (tokenheader) {
        try {
            const decoded = jwt.verify(tokenheader, process.env.JWT_SECRET)
            const userNIF = decoded.nif
            console.log(userNIF)
            // assign the user to his type located in other tables

            //there is 3 tables that inherit from users
            //administradores, compradores, vendedores
            //check if user is administrador
            try {
                let result = await client.query('SELECT CASE WHEN EXISTS(SELECT 1 FROM administrador WHERE users_nif = $1) THEN true ELSE false END AS isadmin', [userNIF])
                console.log("isadmin: " + result.rows[0].isadmin)
                //! validate if user permissions corresponds to the type of user being created
                if (result.rows[0].isadmin === false && type !== "comprador") {
                    return res.status(400).json({
                        status: 400,
                        errors: "You don't have permissions to create a user of type: " + type,
                    });
                }
            } catch (err) {
                console.log(err)
                res.status(500).json({
                    status: 500,
                    errors: "Couldn't fetch admins: " + err,
                });
            }

        } catch (err) {
            console.warn("Couldn't verify the authenticity of the user, token invalid.")
            if (type !== "comprador") {
                return res.status(401).json({
                    status: 401,
                    errors: "Couldn't verify the authenticity of the user and you are tring to create an administrador or vendedor. Please Log In again.",
                });
            }
        }
    } else {
        console.warn("User tried to signup without token.\nThis is fine if he wants to create a comprador account.")
        if (type !== "comprador") {
            return res.status(400).json({
                status_code: 400,
                errors: "You did not provide a token, so you can't create an administrador or vendedor account."
            });
        }
    }

    // User validation done. Procede to create the user
    try {
        //* validate required fields

        // we can only use if's since we always return inside of the conditions
        if (type === "comprador" && !morada) {
            return res.status(400).json({
                status: 400,
                errors: "Missing fields. Fields Required: morada (type is comprador)",
            });
        }
        if (type === "comprador" && morada.length < 5) {
            return res.status(400).json({
                status: 400,
                errors: "Invalid morada. morada must be at least 5 chars",
            });
        }
        if (type !== "comprador" && type !== "vendedor" && type !== "administrador") {
            return res.status(400).json({
                status: 400,
                errors: "User type invalid. It must be 'comprador', 'vendedor' or 'administrador'"
            })
        }
        if (nif.toString().length !== 9 || nif.toString().match(/^[0-9]+$/) === null) {
            return res.status(400).json({
                status_code: 400,
                errors: "NIF must be 9 digits long! Only Digits allowed."
            })
        }
        //validate email
        if (email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) === null) {
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



    // check if user exists using email or nif. Select from the users tables the user with the same email or nif
    client.query('SELECT * FROM users WHERE nif = $1 OR email = $2::text OR username = $3::text', [nif, email, username], async (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                status_code: 500,
                errors: err.message,
            });
        }
        if (result.rows.length > 0) {
            console.log("User already exists!")

            const userfound = result.rows[0]
            if (userfound.email === email) {
                return res.status(400).json({
                    status_code: 400,
                    errors: "Email already exists!",
                });
            } else if (userfound.nif === nif.toString()) { //to string aqui para nao dar erro de comparação de números
                return res.status(400).json({
                    status_code: 400,
                    errors: "NIF already exists!",
                });
            }
            else if (userfound.username === username) {
                return res.status(400).json({
                    status_code: 400,
                    errors: "Username already exists!",
                });
            }
        }
        else {
            // salt and hash the password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            //get current time
            const now = new Date();

            //setting up queries
            const query_deafault_user = 'INSERT INTO users (nif, username, email, password, created_on, last_login) VALUES ($1, $2, $3, $4, $5, $6) RETURNING nif, username, email'
            let query_user_type;

            switch (type) {
                case "comprador":
                    query_user_type = 'INSERT INTO comprador (morada, users_nif ) VALUES ($1, $2)'
                    break;
                case "vendedor":
                    query_user_type = 'INSERT INTO vendedor (users_nif) VALUES ($1)'
                    break;
                case "administrador":
                    query_user_type = 'INSERT INTO administrador (users_nif) VALUES ($1)'
                    break;
                default:
                    return res.status(400).json({
                        status_code: 400,
                        errors: "User type invalid. It must be 'comprador', 'vendedor' or 'administrador'"
                    })
            }


            let result;
            try {
                await client.query('BEGIN')
                result = await client.query(query_deafault_user, [nif, username, email, hash, now, null])

                if (type === "comprador") {
                    await client.query(query_user_type, [morada, nif])
                }
                else {
                    await client.query(query_user_type, [nif])
                }
                await client.query('COMMIT')

            } catch (error) {
                console.log("Error, Rollbacking...")
                console.log(error)

                result = []
                await client.query('ROLLBACK')
                return res.status(500).json({
                    status_code: 500,
                    message: "Roolbacked: " + error.message,
                });

            } finally {
                //console.log(nif, username, email, hash, now, null)
                if (result.rows) { //to prevent node throwing a error: "cant read property 'length' of undefined"
                    if (result.rows.length > 0) {

                        const user = result.rows[0];
                        return res.status(201).json({
                            status_code: 201,
                            message: "User registered successfully!",
                            result: {
                                nif: user.nif,
                                username: user.username,
                                email: user.email,
                                type: type,
                            }
                        });
                    }
                    else {
                        return res.status(500).json({
                            status_code: 500,
                            message: "Error. User not created",
                        });
                    }
                }

            }
        }
    });


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
            errors: "Missing fields. Username and password are required!",
        });
    }

    // check if user exists with email
    /*
        SELECT * FROM users WHERE email = $1::text
        UPDATE users SET last_login = $1 WHERE nif = $2 RETURNING nif, username, email
    */
    client.query('SELECT * FROM users WHERE username = $1::text', [username], (err, result) => {

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
        } else if (result.rows.length === 1) {
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
                                    // console.log(result.rows)
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
                        errors: "Username or password is incorrect!",
                    });
                }
            });
        }
        else {
            //this shouldnt happen since username is unique
            console.log("More than one user with same username!")
            return res.status(500).json({
                status_code: 500,
                errors: "Error. User not created",
            });
        }
    })
}