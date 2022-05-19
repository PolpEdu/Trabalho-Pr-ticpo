// ! Pagina que verifica se o user esta logged in !

const jwt = require("jsonwebtoken");
//import tokennotfound error fro merror.js
const client = require('../utils/connection')


module.exports = (req, res, next) => {
    try {
        if (
            req.headers.authorization === null ||
            req.headers.authorization === undefined
        ) {
            console.log("Desculpa algo correu mal, não estas logged in! No token presented.");
            return res.status(401).json({
                status_code: 401,
                error: "Something went wrong, you are not logged in!",
            });
        }

        const tokenheader = req.headers.authorization;
        try {
            const decoded = jwt.verify(tokenheader, process.env.JWT_SECRET);
            req.userData = decoded; //append to request object
            if (decoded) {
                client.query('SELECT CASE WHEN EXISTS(SELECT 1 FROM users WHERE nif = $1) THEN true ELSE false END AS exists', [decoded.nif], (err, result) => {
                    if (err) {
                        console.log("err: ", err);
                        return res.status(401).json({
                            status_code: 401,
                            error: "Something went wrong, couldn't verify user.",
                        });
                    }
                    console.log("Did the token match any user? ", result.rows[0].exists);
                    if (result.rows[0].exists == true) {
                        next();
                    } else {
                        return res.status(401).json({
                            status_code: 401,
                            error: "Something went wrong, token doesn't match any user.",
                        });
                    }
                });
            } else {
                return res.status(401).json({
                    status_code: 401,
                    error: "Something went wrong, token is invalid!",
                });
            }
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    status_code: 401,
                    error: "Something went wrong, token has expired!",
                });
            }
            console.log("error: ", error);
            return res.status(401).json({
                status_code: 401,
                error: "Something went wrong, token is invalid!",
            });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            status_code: 401,
            error: error,
        });
    }
};