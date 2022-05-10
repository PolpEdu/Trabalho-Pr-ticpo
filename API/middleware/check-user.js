// ! Pagina que verifica se o user esta logged in !

const jwt = require("jsonwebtoken");
//import tokennotfound error fro merror.js
const TokenNotFound = require("../utils/errors");


module.exports = (req, res, next) => {
    try {
        if (
            req.headers.authorization === null ||
            req.headers.authorization === undefined
        ) {
            console.log("Desculpa algo correu mal, não estas logged in!");
            throw new TokenNotFound();
        }

        const tokenheader = req.headers.authorization;
        const decoded = jwt.verify(tokenheader, process.env.JWT_SECRET);
        console.log("middlware decode: ", decoded);
        req.userData = decoded;
        next();
    } catch (error) {
        let msg;
        if (error instanceof TokenNotFound) {
            msg = "Something went wrong, you are not logged in!";
        } else if (error instanceof TypeError) {
            msg = "Something went wrong, token is invalid!";
        } else {
            console.log(error);
            msg = error.message;
        }
        res.status(401).json({
            status: 401,
            errors: msg,
        });
    }
};