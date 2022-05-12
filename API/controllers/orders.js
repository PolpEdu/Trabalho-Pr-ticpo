const client = require('../utils/connection.js')

exports.buyproduct = (req, res, next) => {
    const SQL = `
        CALL order(nif, id_produto, quantidade);
        `



}
