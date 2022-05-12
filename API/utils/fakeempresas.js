const client = require("./connection.js");

async function insertfakeEmpresas() {

    //check whether table empresas contains the nif  
    const query_check_empresas = 'SELECT CASE WHEN EXISTS(SELECT 1 FROM empresas WHERE nif = $1) THEN true ELSE false END AS exists';
    let res = await client.query(query_check_empresas, [111111111]);
    if (res.rows[0].exists) {
        console.log("Table empresas already contains the fake data.\n\n\n");
        return;
    }






    const query_insert_empresa = 'INSERT INTO empresas (nif, nome, telefone, email,  morada, codigo_postal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING nif, nome, telefone, email, morada, codigo_postal';
    for (let i = 1; i < 6; i++) {
        let nif = "";
        for (let j = 1; j < 9; j++) {
            nif += i;
        }
        nif += i;
        const nome = "Empresa" + i;
        const telefone = "9" + i + "9" + i + "9" + i + "9";
        const email = "empresa" + i + "@empresa.com";
        const morada = "Rua " + i + "," + i + "," + i + "," + i + "," + i;
        let codigo_postal = "";
        for (let j = 1; j < 7; j++) {
            codigo_postal += i;
        }


        const values = [
            parseInt(nif),
            nome,
            telefone,
            email,
            morada,
            codigo_postal,
        ];
        client.query(query_insert_empresa, values, (err, result) => {
            if (err) {
                console.log("erro");
                return;
            }
            //console.log(result.rows[0]);
        });
    }
    console.log("Fake empresas inserted.");

}

module.exports = insertfakeEmpresas;

