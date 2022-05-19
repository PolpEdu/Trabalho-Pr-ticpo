const client = require("./connection.js");

async function insertFakeProducts() {

    //check whether table empresas contains the nif  
    const query_check_products = 'SELECT CASE WHEN EXISTS(SELECT 1 FROM products WHERE id = $1) THEN true ELSE false END AS exists';
    const res = await client.query(query_check_products, [1]);
    if (res.rows[0].exists) {
        console.log("Table products already contains the fake data.\n\n\n");
        return;
    }


    const query_insert_product = 'INSERT INTO products (name, description, price) VALUES ($1, $2, $3)';
    for (let i = 1; i < 6; i++) {
        const nome = "Product" + i;
        const descricao = "Descricao" + i;
        const preco = i * i;

        const values = [
            nome,
            descricao,
            preco,
        ];
        client.query(query_insert_product, values, (err, result) => {
            if (err) {
                console.log("erro");
                console.log(err);
                return;
            }
            //console.log(result.rows[0]);
        });
    }
    console.log("Fake products inserted.");

    //insert fake stocks in the stock_products table
    const query_insert_stock = 'INSERT INTO stock_product (stock, empresas_nif, products_id) VALUES ($1, $2, $3) RETURNING stock, empresas_nif, products_id';
    for (let i = 1; i < 6; i++) {
        const id_produto = i;
        const stock =i*10;
        let nif = "";
        for (let j = 1; j < 9; j++) {
            nif += i;
        }
        nif += i;
        const values = [
            stock,
            nif,
            id_produto,
        ];
        client.query(query_insert_stock, values, (err, result) => {
            if (err) {
                console.log("erro");
                console.log(err);
                return;
            }
            //console.log(result.rows[0]);
        });
    }
    console.log("Fake stocks inserted.");

    // insert also fake specification 
    const query_insert_specification = 'INSERT INTO specification (name, valor_da_spec, products_id) VALUES ($1, $2, $3)';
    for (let i = 1; i < 6; i++) {
        const nome = "Specification" + i;
        const descricao = "Descricao" + i;
        const id = i;

        const values = [
            nome,
            descricao,
            id,
        ];
        client.query(query_insert_specification, values, (err, result) => {
            if (err) {
                console.log("erro");
                console.log(err);
                return;
            }
            //console.log(result.rows[0]);
        });
    }
    console.log("Fake specification inserted.");

}

module.exports = insertFakeProducts;

