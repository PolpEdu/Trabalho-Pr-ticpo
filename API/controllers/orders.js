const client = require('../utils/connection.js')

exports.buyproduct = async (req, res, next) => {

    /*
    * Request has this type: (product_id, quantity)
    * {
    *  "cart": [
    *    [1, 10],
    *    [2, 20],
    *    [3, 30]
    *  ]
    * }
    */
    const SQLPROCEDURE = `
   CALL orderEXEC($1,$2,$3,$4)
    `
    const userbuyer = req.userData // set in the middleware
    let results = []
    //loop through cart array
    for (let i = 0; i < req.body.cart.length; i++) {
        const product_id = req.body.cart[i][0];
        const quantity = req.body.cart[i][1];
        //console.log(product_id, quantity)
        //console.log([userbuyer.nif, product_id, quantity, "Sent"])
        try {
            await client.query("BEGIN")
            await client.query(SQLPROCEDURE, [userbuyer.nif, product_id, quantity, "Sent"])
            await client.query("COMMIT")

            results.push({
                product_id: product_id,
                quantity: quantity,
                status: "Sent"
            })
        }
        catch (error) {
            console.log(error)
            await client.query("ROLLBACK")
            return res.status(500).json({
                status_code: 500,
                error: "Something went wrong, couldn't buy product: " + error.message,
            });
        }
    }

    if (results.length > 0) {
        return res.status(200).json({
            status_code: 200,
            message: "Products bought successfully!",
            data: results
        });
    } else {
        return res.status(500).json({
            status_code: 500,
            error: "Unchanged",
        });
    }

}
