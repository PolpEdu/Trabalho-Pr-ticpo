// ! Pagina que verifica se o user esta logged in !

const jwt = require("jsonwebtoken");
const client = require('../utils/connection')


module.exports = (req, res, next) => {
    try {
        if (
            req.headers.authorization === null ||
            req.headers.authorization === undefined
        ) {
            console.log("Desculpa algo correu mal, não estas logged in!");
            return res.status(401).json({
                status_code: 401,
                error: "Something went wrong, you are not logged in!",
            });
        }

        try {
            const tokenheader = req.headers.authorization;
        const decoded = jwt.verify(tokenheader, process.env.JWT_SECRET);
        console.log("Admin connected: ");
        console.log(decoded);
        req.userData = decoded;
        if (decoded) {

            client.query(`SELECT CASE WHEN EXISTS(SELECT 1 FROM administrador WHERE users_nif = '${decoded.nif}') THEN true ELSE false END AS exists`, (err, result) => {
                if (err) {
                    console.log("err: ", err);
                    return res.status(401).json({
                        status_code: 401,
                        error: "Something went wrong, couldn't verify user.",
                    });
                }
                if (result.rows[0].exists == true) {
                    console.log("Admin logged in!");
                    next();
                }
                else {
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