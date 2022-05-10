const client = require('../utils/connection.js')

exports.getproducts = (req, res) => {
    const query = 'SELECT * FROM products'
    client.query(query, (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                status: 500,
                errors: "Couldn't fetch products: " + err.message,
            })
        }
        return res.status(200).json({
            status: 200,
            data: result.rows
        })
    });

}

exports.registerproduct = async (req, res) => {
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
    const query_deafault_product = 'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING name, price, description, id'

    let query_product_type;

    switch (type) {
        case "televisoes":
            // no values for televisoes
            query_product_type = 'INSERT INTO televisoes (products_id) VALUES ($1) RETURNING products_id'
            break;
        case "smartphones":
            query_product_type = 'INSERT INTO smartphones (products_id) VALUES ($1) RETURNING products_id'
            break;
        case "computadores":
            query_product_type = 'INSERT INTO computadores (products_id) VALUES ($1) RETURNING products_id'
            break;
        default:
            //code doesnt reach here
            return res.status(400).json({
                status_code: 400,
                errors: "Product type invalid. It must be 'televisoes', 'smartphones' or 'computadores'"
            })
    }

    try {
        const result = await client.query(
            `SELECT CASE WHEN EXISTS(SELECT 1 FROM products WHERE name = $1) THEN true ELSE false END AS isproduct`, [name]
        );
        //TODO: erro aqui
        if (result.rows[0].isproduct === true) {
            return res.status(400).json({
                status: 400,
                errors: 'Product with name: ' + name + ' already exists',
            });
        } else {
            //todo begin transaction and insert the product into his type, to his specs, to his empresa_produtora along with the stock
            let result2;
            try {
                await client.query('BEGIN')
                const result = await client.query(query_deafault_product, [name, price, description])
                console.log("result first product query::" + result.rows[0])
                const product_id = result.rows[0].id

                result2 = await client.query(query_product_type, [product_id])
                console.log(result2.rows[0])
                await client.query('COMMIT')


            } catch (err) {
                console.log("error. Rollbacking..." + err.message)
                await client.query('ROLLBACK')
                return res.status(500).json({
                    status: 500,
                    errors: err.message,
                });
            } finally {
                if (result2.rows) { //to prevent node throwing a error: "cant read property 'length' of undefined"
                    if (result2.rows.length > 0) {

                        const product = result2.rows[0];
                        return res.status(201).json({
                            status_code: 201,
                            message: "User registered successfully!",
                            result: {
                                product_id: product.id,
                                name: product.name,
                                price: product.price,
                                description: product.description,
                            }
                        });
                    }
                    else {
                        return res.status(500).json({
                            status_code: 500,
                            message: "Error. User not created",
                        });
                    }
                }
            }

        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            errors: "Couldn't fetch products: " + error.message,
        });
    }


}
