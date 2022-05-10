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
                status: 401,
                error: "Something went wrong, you are not logged in!",
            });
        }

        const tokenheader = req.headers.authorization;
        const decoded = jwt.verify(tokenheader, process.env.JWT_SECRET);
        const nif = parseInt(decoded.nif);
        req.userData = decoded;
        if (decoded) {
            client.query(`SELECT CASE WHEN EXISTS(SELECT 1 FROM administrador, vendedor WHERE administrador.users_nif = '${nif}' OR vendedor.users_nif = '${nif}') THEN true ELSE false END AS exists`, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(401).json({
                        status: 401,
                        error: "Something went wrong, couldn't verify user.",
                    });
                }
                if (result.rows[0].exists == true) {
                    console.log("Comprador logged in");
                    next();
                } else {
                    return res.status(401).json({
                        status: 401,
                        error: "Something went wrong, token doesn't match any administrator.",
                    });
                }
            });

        };
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            status: 401,
            error: error,
        });
    }
}