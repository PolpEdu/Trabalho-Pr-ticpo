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

exports.registerproduct = (req, res) => async {
    /* Example:
    {
        "name": "Product 1", //obrigatório
        "price": 100, // obrigatório
        "type": "computador", // obrigatório
        "empresa_produtora": 123456789, // obrigatório
        "stock": 10, // obrigatório

        "description": "This is a product", // não obrigatório
        "specs_id": 1, // não obrigatório
    }
    */
    const { type, specs_id, empresa_produtora, name, price, stock, description } = req.body;

    //version defaults to 1
    if (!type || !name || !price || !stock || !empresa_produtora) {
        res.status(400).json({
            status: 400,
            errors: 'Missing required fields: name, price, type, empresa_produtora, stock',
        });
    }

    //check if product already exists
    // SELECT CASE WHEN EXISTS(SELECT 1 FROM administrador WHERE users_nif = $1) THEN true ELSE false END AS isadmin
    try {
        const result = await client.query(
            `SELECT CASE WHEN EXISTS(SELECT 1 FROM products WHERE name = $1) THEN true ELSE false END AS isproduct`,
        );
        if (result.rows[0].isproduct === true) {
            return res.status(400).json({
                status: 400,
                errors: 'Product with name: ' + name + ' already exists',
            });
        } else {
            //todo begin transaction and insert the product into his type, to his specs, to his empresa_produtora along with the stock
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            errors: "Couldn't fetch products: "+ error.message,
        });
    }
    

}
