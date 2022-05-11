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
        if (result.rows[0].isproduct === true) {
            return res.status(400).json({
                status: 400,
                errors: 'Product with name: ' + name + ' already exists',
            });
        } else {

            let result2;
            let result;
            try {
                await client.query('BEGIN')
                result = await client.query(query_deafault_product, [name, price, description])
                const product_id = result.rows[0].id


                result2 = await client.query(query_product_type, [product_id])
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
                        //if we have a product id in result2, we returned the product id so the transaction was successfully committed
                        const result_product = {
                            product_id: parseInt(result2.rows[0].products_id),
                            name: result.rows[0].name,
                            price: parseInt(result.rows[0].price),
                            description: result.rows[0].description,
                        }

                        console.log("Product registered successfully: ");
                        console.log(result_product);


                        return res.status(201).json({
                            status_code: 201,
                            message: "User registered Product successfully!",
                            result: result_product
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


exports.updateproduct = async (req, res) => {
    /* Example, in the body of the request there is the fields that we want to update:
    {
        “description”: "new description",
        “price”: 1234567,
        (and other fields if we want to update them)
    }
    */
    const { id } = req.params;


    // get all the objects from the body








}
