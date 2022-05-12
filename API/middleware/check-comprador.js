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

        const tokenheader = req.headers.authorization;
        const decoded = jwt.verify(tokenheader, process.env.JWT_SECRET);
        const nif = parseInt(decoded.nif);
        req.userData = decoded;
        if (decoded) {
            //check if nif exists in users_nif from tables administrador or vendedor
            client.query('SELECT CASE WHEN EXISTS(SELECT 1 FROM administrador AS admin WHERE admin.users_nif = $1) THEN 1 ELSE 0 END AS admin, CASE WHEN EXISTS(SELECT 1 FROM vendedor AS vend WHERE vend.users_nif = $2) THEN 1 ELSE 0 END AS vend', [nif, nif], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(401).json({
                        status_code: 401,
                        error: "Something went wrong, couldn't verify user.",
                    });
                }
                //console.log("is adm? " + result.rows[0].admin);
                //console.log("is vend? " + result.rows[0].vend);
                if (result.rows[0].admin == true || result.rows[0].vend == true) {
                    next();
                } else {
                    return res.status(401).json({
                        status_code: 401,
                        error: "Something went wrong, token doesn't match any administrator.",
                    });
                }
            });

        };
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            status_code: 401,
            error: error,
        });
    }
}