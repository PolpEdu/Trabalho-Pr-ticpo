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
        "type": "computadores", // obrigatório -> computadores, smartphones, tablets, televisoes
        "empresa_produtora": 123456789, // obrigatório
        "stock": 10, // obrigatório

        "description": "This is a product", // não obrigatório
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
        "name": "Product 1", 
        "price": 100, 
        "type": "computadores",
        “description”: "new description",
        "empresa_produtora": 123456789,
        "stock": 10,
    }
    */
    console.log(req.params)
    const { id } = req.params;
    const { name, description, price, type, empresa_produtora, stock } = req.body;

    if (type) { // first check if we want to change the type of the product, if so we need to change it from the current type table to the new one
        let query_update_televisoes;
        let query_update_smartphones;
        let query_update_computadores;

        console.log("Changing type")
        //decided to not check if the product is already in the new type table, if it is the query wouldn't change anything....
        switch (type) {
            case "televisoes":
                query_update_televisoes = 'UPDATE televisoes SET products_id = $1 WHERE products_id = $2'
                query_update_computadores = 'DELETE FROM computadores WHERE products_id = $1'
                query_update_smartphones = 'DELETE FROM smartphones WHERE products_id = $1'
                break;
            case "smartphones":
                query_update_televisoes = 'DELETE FROM televisoes WHERE products_id = $1'
                query_update_computadores = 'DELETE FROM computadores WHERE products_id = $1'
                query_update_smartphones = 'UPDATE smartphones SET products_id = $1 WHERE products_id = $2'
                break;
            case "computadores":
                query_update_televisoes = 'DELETE FROM televisoes WHERE products_id = $1'
                query_update_computadores = 'UPDATE computadores SET products_id = $1 WHERE products_id = $2'
                query_update_smartphones = 'DELETE FROM smartphones WHERE products_id = $1'
                break;
            default:
                return res.status(400).json({
                    status: 400,
                    errors: "Product type invalid. It must be 'televisoes', 'smartphones' or 'computadores'"
                });
        }

        try {
            await client.query('BEGIN') //needs to be a transaction to avoid errors

            let values_from_product_type = [id, id] // if product is from the query type we need to two ids - For UPDATE query
            let values_one_argument_id = [id] //if not we only need one id - For DELETE query

            await client.query(query_update_televisoes, type === "televisoes" ? values_from_product_type : values_one_argument_id)
            await client.query(query_update_smartphones, type === "smartphones" ? values_from_product_type : values_one_argument_id)
            await client.query(query_update_computadores, type === "computadores" ? values_from_product_type : values_one_argument_id)
            await client.query('COMMIT')
        } catch (err) {
            console.log("error. Rollbacking..." + err.message)
            await client.query('ROLLBACK')
            return res.status(500).json({
                status: 500,
                errors: "Couldn't change the type of the product: " + err.message,
            });
        } finally {
            //TODO: bug here for some reason.
            // finnaly is executed even if the transaction is rollbacked for some reason.
            console.log("Product type changed successfully")
            return res.status(204).json({
                status: 204,
                message: "Product type changed successfully",
            });
        }

    } else { //we dont want to change the type
        console.log("Not changing type")

    }



    console.log("yo")




}
