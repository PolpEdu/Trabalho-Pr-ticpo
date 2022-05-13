const client = require('../utils/connection.js')

exports.leaveRating = async (req, res, next) => {
    /*
    * Request has this type: (product_id, quantity)	
    * {
    *   "quantity": 5 //from 0 to 5
    *   "comment": "This is a comment for the product"
    * }
    */

    //get the product id
    const { id } = req.params;
    const nif = parseInt(req.userData.nif);


    const { comment, quantity } = req.body;
    if (!quantity) {
        return res.status(400).json({
            status_code: 400,
            error: "You need to provide a quantity to rate!",
        });
    }


    // check if the user has the product by querying orders with the users_nif and compra_product with the order nif
    const query = `SELECT CASE WHEN EXISTS(SELECT 1 FROM orders, compra_product WHERE orders.users_nif = '${nif}'
     AND compra_product.orders_order_id = orders.order_id AND compra_product.products_id = '${id}') THEN true ELSE false END AS exists`;

    try {
        const result = await client.query(query);
        const exists = result.rows[0].exists;

        if (exists === true) {
            const response = await client.query(`INSERT INTO rating (products_id, users_nif, comment, quantity) VALUES ($1, $2, $3, $4) RETURNING *`, [id, nif, comment, quantity]);

            return res.status(201).json({
                status_code: 201,
                message: "Rating created!",
                data: response.rows[0],
            });
        } else {
            return res.status(400).json({
                status_code: 400,
                error: "You can't rate this product, you haven't bought it!",
            });
        }

    } catch (error) {
        if (error.code === '23505') { //duplicate key
            return res.status(400).json({
                status_code: 400,
                error: "You can't rate this product twice!",
            });
        }
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            message: 'Internal server error.'
        });
    }
}