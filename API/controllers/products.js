const client = require('../utils/connection.js')

exports.getproducts = (req, res) => {
    const query = 'SELECT * FROM products'
    client.query(query, (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                status_code: 500,
                errors: "Couldn't fetch products: " + err.message,
            })
        }
        return res.status(200).json({
            status_code: 200,
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
        "nif_empresa_produtora": 123456789, // obrigatório
        "stock": 10, // obrigatório

        "description": "This is a product", // não obrigatório
    }
    */
    const { type, specs_id, nif_empresa_produtora, name, price, stock, description } = req.body;

    //version defaults to 1
    if (!type || !name || !price || !stock || !nif_empresa_produtora) {
        res.status(400).json({
            status_code: 400,
            errors: 'Missing required fields: name, price, type, empresa_produtora, stock',
        });
    }

    //check if product already exists
    // SELECT CASE WHEN EXISTS(SELECT 1 FROM administrador WHERE users_nif = $1) THEN true ELSE false END AS isadmin
    const query_deafault_product = 'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING name, price, description, id'
    const query_stock_products = 'INSERT INTO stock_product (stock, empresas_nif, products_id) VALUES ($1, $2, $3) RETURNING stock, empresas_nif, products_id';

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
        const result_check_exists = await client.query(
            `SELECT CASE WHEN EXISTS(SELECT 1 FROM products WHERE name = $1) THEN true ELSE false END AS isproduct`, [name]
        );
        const result_check_empresa_exists = await client.query(
            `SELECT CASE WHEN EXISTS(SELECT 1 FROM empresas WHERE nif = $1) THEN true ELSE false END AS isempresa`, [nif_empresa_produtora]
        );

        if (result_check_exists.rows[0].isproduct === true) {
            return res.status(400).json({
                status_code: 400,
                errors: 'Product with name: ' + name + ' already exists',
            });
        }
        if (result_check_empresa_exists.rows[0].isempresa === false) {
            return res.status(400).json({
                status_code: 400,
                errors: 'Empresa with nif: ' + nif_empresa_produtora + ' does not exist',
            });
        }

        let result_stocks; //result of query_stock_products
        let result2; // for table of specific product type
        let result; // for default product
        try {
            await client.query('BEGIN')
            result = await client.query(query_deafault_product, [name, price, description])
            const product_id = result.rows[0].id
            result2 = await client.query(query_product_type, [product_id])
            result_stocks = await client.query(query_stock_products, [stock, nif_empresa_produtora, product_id])


            await client.query('COMMIT')

        } catch (err) {
            console.log("error. Rollbacking..." + err.message)
            await client.query('ROLLBACK')
            result2 = null;
            return res.status(500).json({
                status_code: 500,
                errors: err.message,
            });
        } finally {
            if (result2) { //to prevent node throwing a error: "cant read property 'length' of undefined"
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



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
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
    let elements_changed = []; // to check what changed in the final response 
    const { id } = req.params;
    const { name, description, price, type, empresa_produtora, stock } = req.body;


    // first check if we want to change the type of the product, if so we need to change it from the current type table to the new one
    if (type) {
        // setup queries that can change depending of the type of the product
        let query_update_televisoes;
        let query_update_smartphones;
        let query_update_computadores;

        //response if a certain product already exists in tables
        let resexists;

        console.log("Changing type: " + type)
        //* decided to not check if the product is already in the new type table, if it is the query wouldn't change anything....
        switch (type) {
            case "televisoes":
                resexists = await client.query(
                    `SELECT CASE WHEN EXISTS(SELECT 1 FROM televisoes WHERE products_id = $1) THEN true ELSE false END AS exists`, [id]
                );
                if (resexists.rows[0].exists === true) {
                    console.log("Product already in televisoes table")
                    return res.status(400).json({
                        status_code: 400,
                        errors: 'Product with id: ' + id + ' already exists in televisoes table',
                    });
                }

                query_update_televisoes = 'INSERT INTO televisoes (products_id) VALUES ($1)'
                query_update_computadores = 'DELETE FROM computadores WHERE products_id = $1'
                query_update_smartphones = 'DELETE FROM smartphones WHERE products_id = $1'

                break;
            case "smartphones":
                resexists = await client.query(
                    `SELECT CASE WHEN EXISTS(SELECT 1 FROM smartphones WHERE products_id = $1) THEN true ELSE false END AS exists`, [id]
                );
                if (resexists.rows[0].exists === true) {
                    console.log("Product already exists in smartphones table")
                    return res.status(400).json({
                        status_code: 400,
                        errors: 'Product with id: ' + id + ' already exists in smartphones table',
                    });
                }

                query_update_televisoes = 'DELETE FROM televisoes WHERE products_id = $1'
                query_update_computadores = 'DELETE FROM computadores WHERE products_id = $1'
                query_update_smartphones = 'INSERT INTO smartphones (products_id) VALUES ($1)'
                break;
            case "computadores":
                resexists = await client.query(
                    `SELECT CASE WHEN EXISTS(SELECT 1 FROM computadores WHERE products_id = $1) THEN true ELSE false END AS exists`, [id]
                );
                if (resexists.rows[0].exists === true) {
                    console.log("Product already exists in computadores table")
                    return res.status(400).json({
                        status_code: 400,
                        errors: 'Product with id: ' + id + ' already exists in the computadores table',
                    });
                }

                query_update_televisoes = 'DELETE FROM televisoes WHERE products_id = $1'
                query_update_computadores = 'INSERT INTO computadores (products_id) VALUES ($1)'
                query_update_smartphones = 'DELETE FROM smartphones WHERE products_id = $1'
                break;
            default:
                return res.status(400).json({
                    status_code: 400,
                    errors: "Product type invalid. It must be 'televisoes', 'smartphones' or 'computadores'"
                });
        }

        try {
            await client.query('BEGIN') //needs to be a transaction to avoid errors

            await client.query(query_update_televisoes, [id])
            await client.query(query_update_smartphones, [id])
            await client.query(query_update_computadores, [id])
            await client.query('COMMIT')
        } catch (err) {
            console.log("error. Rollbacking...\n" + err.message)
            await client.query('ROLLBACK')
            return res.status(500).json({
                status_code: 500,
                errors: "Couldn't change the type of the product: " + err.message,
            });
        } finally {
            console.log("Product type changed successfully!")
            elements_changed.push("type");

            /*
            return res.status(200).json({ //! don't set status code to 204, it has no body attached by default. 
                status_code: 200,
                message: "Product type changed successfully!",
            });
            */
        }
    }

    if (empresa_produtora) {
        //we can't have a new empresa produtora without a stock
        if (!stock) {
            return res.status(400).json({
                status_code: 400,
                errors: "Stock is required if you want to change the empresa produtora",
            });
        }
        //query the table stock_product and change the stock from the current empresa_produtora to the new one along with the stock
        const query_update_stock = 'UPDATE stock_product SET empresa_produtora = $1, stock = $2 WHERE products_id = $3'
        const query_reset_current_stock = 'UPDATE stock_product SET stock = 0 WHERE empresa_produtora = $1 AND products_id = $2'
        try {
            await client.query('BEGIN') //needs to be a transaction to avoid errors
            await client.query(query_update_stock, [empresa_produtora, stock, id])
            await client.query(query_reset_current_stock, [empresa_produtora, id])
            await client.query('COMMIT')
        } catch (err) {
            console.log("error. Rollbacking...\n" + err.message)
            await client.query('ROLLBACK')
            return res.status(500).json({
                status_code: 500,
                errors: "Couldn't change the empresa produtora of the product: " + err.message,
            });
        } finally {
            console.log("Empresa produtora changed successfully!")
            elements_changed.push("empresa_produtora");
            elements_changed.push("stock");

            /*
            return res.status(200).json({
                status_code: 200,
                message: "Empresa produtora, along with the respective stock changed successfully!",
            })
            */
        }
    }

    if (stock) {
        const query_update_stock = 'UPDATE stock_product SET stock = $1 WHERE products_id = $2'
        try {
            await client.query(query_update_stock, [stock, id])
        } catch (err) {
            console.log("error: " + err.message)
            return res.status(500).json({
                status_code: 500,
                errors: "Couldn't change the stock of the product: " + err.message,
            });
        } finally {
            console.log("Stock changed successfully!")
            elements_changed.push("stock");
        }
    }
}
