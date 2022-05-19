const client = require('../utils/connection.js')
const updateType = require('../utils/updateproducttype')


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
    })

}

exports.registerproduct = async (req, res) => {
    /* Example:
    {
        "name": "Product 1", //obrigatório
        "price": 100, // obrigatório
        "type": "computadores", // obrigatório -> computadores, smartphones, tablets, televisoes
        "nif_empresa_produtora": 111111111, // obrigatório
        "stock": 10, // obrigatório

        "description": "This is a product" // não obrigatório
    }
    */
    const { type, specs_id, nif_empresa_produtora, name, price, stock, description } = req.body

    //version defaults to 1
    if (!type || !name || !price || !stock || !nif_empresa_produtora) {
        return res.status(400).json({
            status_code: 400,
            errors: 'Missing required fields: name, price, type, empresa_produtora, stock',
        })
    }

    //check if product already exists
    // SELECT CASE WHEN EXISTS(SELECT 1 FROM administrador WHERE users_nif = $1) THEN true ELSE false END AS isadmin
    const query_deafault_product = 'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING name, price, description, id'
    const query_stock_products = 'INSERT INTO stock_product (stock, empresas_nif, products_id) VALUES ($1, $2, $3) RETURNING stock, empresas_nif, products_id'

    let query_product_type

    switch (type) {
        case "televisoes":
            // no values for televisoes
            query_product_type = 'INSERT INTO televisoes (products_id) VALUES ($1) RETURNING products_id'
            break
        case "smartphones":
            query_product_type = 'INSERT INTO smartphones (products_id) VALUES ($1) RETURNING products_id'
            break
        case "computadores":
            query_product_type = 'INSERT INTO computadores (products_id) VALUES ($1) RETURNING products_id'
            break
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
        )
        const result_check_empresa_exists = await client.query(
            `SELECT CASE WHEN EXISTS(SELECT 1 FROM empresas WHERE nif = $1) THEN true ELSE false END AS isempresa`, [nif_empresa_produtora]
        )

        if (result_check_exists.rows[0].isproduct === true) {
            return res.status(400).json({
                status_code: 400,
                errors: 'Product with name: ' + name + ' already exists',
            })
        }
        if (result_check_empresa_exists.rows[0].isempresa === false) {
            return res.status(400).json({
                status_code: 400,
                errors: 'Empresa with nif: ' + nif_empresa_produtora + ' does not exist',
            })
        }

        let result_stocks //result of query_stock_products
        let result2 // for table of specific product type
        let result // for default product
        try {
            await client.query('BEGIN')
            result = await client.query(query_deafault_product, [name, price, description])
            const product_id = result.rows[0].id
            result2 = await client.query(query_product_type, [product_id])
            result_stocks = await client.query(query_stock_products, [stock, nif_empresa_produtora, product_id])

            /*const result_old_prod = await client.query('INSERT INTO old_products (name, price, description, date_added) VALUES ($1, $2, $3, $4) RETURNING id', [name, price, description, new Date()])
            const old_prod_id = result_old_prod.rows[0].id
            //insert into versions table
            await client.query('INSERT INTO old_product_versions (products_id, version, old_products_id) VALUES ($1, $2, $3)', [product_id, 0, old_prod_id])*/


            await client.query('COMMIT')

        } catch (err) {
            console.log("error. Rollbacking..." + err.message)
            await client.query('ROLLBACK')
            result2 = null
            console.log(err)
            return res.status(500).json({
                status_code: 500,
                errors: err.message,
            })
        } finally {
            if (result2) { //to prevent node throwing a error: "cant read property 'length' of undefined"
                if (result2.rows.length > 0) {
                    //if we have a product id in result2, we returned the product id so the transaction was successfully committed
                    const result_product = {
                        product_id: parseInt(result2.rows[0].products_id),
                        name: result.rows[0].name,
                        price: parseInt(result.rows[0].price),
                        description: result.rows[0].description,
                        stock: parseInt(result_stocks.rows[0].stock),
                        empresa_nif: parseInt(result_stocks.rows[0].empresas_nif),
                    }

                    return res.status(201).json({
                        status_code: 201,
                        message: "User registered Product successfully!",
                        result: result_product
                    })
                }
                else {
                    return res.status(500).json({
                        status_code: 500,
                        message: "Error. Couldn't register product",
                    })
                }
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status_code: 500,
            errors: "Couldn't fetch products: " + error.message,
        })
    }


}

//update product procedure transaction:
// 1. check if product exists
// 2. update the product with the id given is params
// 3. create 
// 4. update the stock with the id given is params
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



    const { id } = req.params
    const { name, description, price, type, empresa_produtora, stock } = req.body
    let product_to_change

    // get the data from the product
    const query_get_product = 'SELECT * FROM products WHERE id = $1'
    const values = [id]
    let result_from_exists
    let current_version
    try {
        await client.query('BEGIN')
        result_from_exists = await client.query(query_get_product, values)

        if (result_from_exists.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(400).json({
                status_code: 400,
                errors: "Product with id " + id + " does not exist",
            })
        }
        current_version = await client.query('SELECT version FROM old_product_versions WHERE products_id = $1 ORDER BY old_product_versions DESC LIMIT 1'
            , values)


    } catch (error) {
        await client.query('ROLLBACK')
        console.log(error)
        return res.status(500).json({
            status_code: 500,
            errors: "Couldn't fetch products: " + error.message,
        })
    }

    // we have the product to update
    product_to_change = result_from_exists.rows[0]

    //each object from body, if it exists, will be updated with the new values else it will remain the same
    const update_object = [
        name ? name : product_to_change.name,
        description ? description : product_to_change.description,
        price ? price : product_to_change.price,
        id
    ]

    const old_product_object = [
        product_to_change.name,
        product_to_change.description,
        product_to_change.price,
        new Date(),
    ]
    const update_empresa = [
        empresa_produtora,
        id
    ]

    const update_stock = [
        stock,
        id
    ]

    // create queries and objects 
    // update the product with the given params
    const query_update_product = 'UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING name, price, description, id'
    const query_new_old_object = 'INSERT INTO old_products (name, description, price, date_added) VALUES ($1, $2, $3, $4) RETURNING name, description, price, date_added, id'
    const query_old_product_versions = 'INSERT INTO old_product_versions (version, old_products_id, products_id) VALUES ($1, $2, $3) RETURNING version, old_products_id,products_id'
    const query_exists_empresa = 'SELECT * FROM empresas WHERE nif = $1'
    //update the empresa and set the stock to 0
    const query_update_empresa = 'UPDATE stock_product SET empresas_nif = $1, stock = 0 WHERE products_id = $2 RETURNING empresas_nif, stock'
    const query_update_stock = 'UPDATE stock_product SET stock = $1 WHERE products_id = $2 RETURNING stock, empresas_nif'


    try {
        await client.query('BEGIN')
        const new_product_updated = await client.query(query_update_product, update_object)
        const old_product_updated = await client.query(query_new_old_object, old_product_object)

        let version = current_version.rows[0] ? parseInt(current_version.rows[0].version) + 1 : 1
        const old_product_versions_updated = await client.query(query_old_product_versions, [version, old_product_updated.rows[0].id, new_product_updated.rows[0].id])
        /*console.log("old product updated: ")
        console.log(old_product_updated.rows[0])
        console.log("new product updated: ")
        console.log(new_product_updated.rows[0])*/

        //check if empresa exists to throw an error if it doesn't
        let stockres;
        let empresares;
        if (empresa_produtora) {
            let result_empresa = await client.query(query_exists_empresa, [empresa_produtora])
            if (result_empresa.rows.length === 0) {
                return res.status(400).json({
                    status_code: 400,
                    errors: "Empresa with nif " + empresa_produtora + " does not exist",
                })
            }
            console.log("updating Empresa")
            empresares = await client.query(query_update_empresa, update_empresa)
        }
        if (stock) {
            console.log("updating stock")
            stockres = await client.query(query_update_stock, update_stock)
        }

        if (type) {
            console.log("updating type")
            updateType(id, type)
        }

        const old_product = old_product_updated.rows[0]
        const new_product = new_product_updated.rows[0]

        // update all order_product containing the old product id to the new product
        const query_update_order_products = 'UPDATE order_product SET products_id = $1 WHERE products_id = $2'
        const values_update_order_products = [new_product.id, old_product.id]
        await client.query(query_update_order_products, values_update_order_products)
        

        await client.query('COMMIT')

        return res.status(200).json({
            status_code: 200,
            message: "Product updated successfully!",
            new_product: {
                product_new: new_product,
                stock: stock ? stockres.rows[0].stock : "Unchanged",
                empresa: empresa_produtora ? empresares.rows[0].empresas_nif : "Unchanged",
            },
            old_product: old_product
        });

    } catch (error) {
        console.log("Error, rollbacking...")
        await client.query('ROLLBACK')
        console.log(error)
        return res.status(500).json({
            status_code: 500,
            errors: "Couldn't update product: " + error.message,
        })
    }

}

exports.getproduct = (req, res, next) => {
     /*
    Get this product information with ONLY ONE QUERY
    */
    const { id } = req.params
    // in one query get the product product:  id, name, price, description, stock from stock_products table,
    // specification (from specification table), all old product versions from old_versions and old_products table,
    // average rating,
    /*{
        “status”: status_code, “errors”: errors (if any occurs)},
        “results”:
        {
            “description”:  “product_description”,
            “prices”: [“current_price_date - current_price”, “prev_price_date  - prev_price”, (…)],
            “rating”: average rating,
            “comments”: [“comment 1”, “comment 2”,  (…)]
        }
    }*/

    const query = `
    SELECT 
        products.id,
        products.name,
        products.price,
        products.description
        FROM products
        INNER JOIN stock_product ON products.id = stock_product.products_id
        
        
    `
    

    client.query(query, [id]).then(result => {
        if (result.rows.length === 0) {
            return res.status(404).json({
                status_code: 404,
                errors: "Product with id " + id + " does not exist",
            })
        }
        return res.status(200).json({
            status_code: 200,
            message: "Product found!",
            results: result.rows
        })
    }).catch(error => {
        return res.status(500).json({
            status_code: 500,
            errors: "Couldn't get product: " + error.message,
        })
    })
    
}

/* 
    DEPRECIATED:
      SELECT
        products.id,
        products.name,
        products.description,
        products.price,
        specification.name,
        old_product_versions.version,
        old_products.name,
        old_products.description,
        old_products.price,
        old_products.date_added,
        AVG(rating.quantity),
        thread.main_pergunta
        FROM products
        LEFT JOIN rating ON products.id = rating.products_id
        LEFT JOIN specification ON specification.products_id = products.id
        LEFT JOIN old_product_versions ON old_product_versions.products_id = products.id AND old_product_versions.old_products_id = $1
        LEFT JOIN old_products ON old_products.id = old_product_versions.old_products_id
        LEFT JOIN thread ON thread.products_id = products.id
        WHERE products.id = $1
        GROUP BY products.id, specification.name, old_product_versions.version,
         old_products.name, old_products.description, old_products.price, old_products.date_added,
        thread.main_pergunta
        ORDER BY old_product_versions.version DESC`

exports.getproduct = (req, res) => {

   
    const { id } = req.params
    const query_get_product = 'SELECT * FROM products WHERE id = $1'
    const values = [id]
    let latest_versions;
    client.query(query_get_product, values).then(async (result, error) => {
        if (error) {
            return res.status(500).json({
                status_code: 500,
                errors: "Couldn't fetch products: " + error.message,
            })
        }
        if (result.rows.length === 0) {
            return res.status(400).json({
                status_code: 400,
                errors: "Product with id " + id + " does not exist",
            })
        }
        //query the old products and add to the result all previous versions
        const query_get_old_products = 'SELECT old_products_id FROM old_product_versions WHERE products_id = $1 ORDER BY old_product_versions ASC'
        try {
            //all previous versions numbers
            const old_prod_res = await client.query(query_get_old_products, values);
            const all_versions = old_prod_res.rows.map(row => parseInt(row.old_products_id))

            // query all the old_products with the previous versions
            const query_get_old_products_with_versions = 'SELECT * FROM old_products WHERE id = ANY($1) ORDER BY id DESC'
            const old_products = await client.query(query_get_old_products_with_versions, [all_versions])
            latest_versions = old_products.rows


        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status_code: 500,
                errors: "Couldn't fetch products: " + error.message,
            })
        }

        const { name, price, description, id } = result.rows[0]
        return res.status(200).json({
            status_code: 200,
            message: "Product fetched successfully!",
            product: {
                name: name,
                price: price,
                description: description,
                main_product_id: id,
            },
            latest_versions: latest_versions
        })
    })
}*/