TokenNotFound.prototype = new Error();

function TokenNotFound() {
    throw {
        name: "Token Not Found Or Inexistent",
        message: "Couldn't find authorization header on request! To access this route, you must be logged in!",
    };
}

//EXPORT tokennotfound error
module.exports = TokenNotFound;
