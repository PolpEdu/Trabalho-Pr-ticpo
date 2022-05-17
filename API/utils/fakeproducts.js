const client = require("./connection.js");

async function insertFakeProducts() {

    //check whether table empresas contains the nif  
    const query_check_products = 'SELECT CASE WHEN EXISTS(SELECT 1 FROM products WHERE id = $1) THEN true ELSE false END AS exists';
    const res = await client.query(query_check_products, [1]);
    if (res.rows[0].exists) {
        console.log("Table products already contains the fake data.\n\n\n");
        return;
    }


    const query_insert_product = 'INSERT INTO products (id, name, description, price) VALUES ($1, $2, $3, $4)';
    for (let i = 1; i < 6; i++) {
        let id = i;
        const nome = "Product" + i;
        const descricao = "Descricao" + i;
        const preco = i * i;
        const stock = i * i;
        const imagem = "imagem" + i + ".jpg";

        const values = [
            parseInt(id),
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
    console.log("Fake products inserted.\n\n\n");

}

module.exports = insertFakeProducts;

