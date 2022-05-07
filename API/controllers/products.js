const client = require('../connection.js')

exports.getproducts = (req, res) => {
    client.query('SELECT * FROM products', (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).json({
                status: 500,
                errors: err.message,
            });
            return;
        }
        res.status(200).json({
            status: 200,
            errors: null,
            results: result.rows
        });
    });
}

exports.registerproduct = (req, res) => {
    /*
    Example: INSERT INTO product (product_id, specs_id, empresaPROD, name, price, quantity, description, stock)
VALUES (2, 2, 1, 'Notebook', 2000, 20, 'Notebook de qualidade', 20);
*/
    const { product_id, specs_id, empresaPROD, name, price, quantity, description, stock } = req.body;
    client.query('INSERT INTO product (product_id, specs_id, empresaPROD, name, price, quantity, description, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [product_id, specs_id, empresaPROD, name, price, quantity, description, stock], (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).json({
                message: "Error not found! Status: 500",
            });
        }
        res.status(200).json({
            message: "Product registered successfully!",
        });
    })
}
