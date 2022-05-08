TokenNotFound.prototype = new Error();

function TokenNotFound() {
    throw {
        name: "Token Not Found Or Inexistent",
        message: "Couldn't find authorization header on request!",
    };
}

//EXPORT tokennotfound error
module.exports = TokenNotFound;
