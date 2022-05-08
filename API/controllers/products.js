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
            results: result.rows
        });
    });
}

exports.registerproduct = (req, res) => {
    /*
    Example: INSERT INTO product (product_id, specs_id, empresaPROD, name, price, quantity, description, stock)
VALUES (2, 2, 1, 'Notebook', 2000, 20, 'Notebook de qualidade', 20);
*/
    const { type, specs_id, empresaPROD, name, price, quantity, description, stock } = req.body;

    client.query('INSERT INTO product (specs_id, empresaPROD, name, price, quantity, description, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [specs_id, empresaPROD, name, price, quantity, description, stock], (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).json({
                status: 500,
                errors: err.message,
            });
        }
        console.log(result)
        res.status(200).json({
            status: 200,
            message: "Product registered successfully!",
            results: result.rows[0].product_id
        })
    })
}
