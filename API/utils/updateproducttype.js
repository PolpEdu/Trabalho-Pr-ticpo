const client = require('../utils/connection')

async function updatetype(id, type) {
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
                throw new Error('Product already in televisoes table');
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
                throw new Error('Product with id ' + id + ' already exists in smartphones table');
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
                throw new Error('Product with id ' + id + ' already exists in computadores table');
            }

            query_update_televisoes = 'DELETE FROM televisoes WHERE products_id = $1'
            query_update_computadores = 'INSERT INTO computadores (products_id) VALUES ($1)'
            query_update_smartphones = 'DELETE FROM smartphones WHERE products_id = $1'
            break;
        default:
            return {
                status_code: 400,
                errors: "Product type invalid. It must be 'televisoes', 'smartphones' or 'computadores'"
            };
    }

    try {
        //await client.query('BEGIN') //needs to be a transaction to avoid errors, transaction already initiated

        await client.query(query_update_televisoes, [id])
        await client.query(query_update_smartphones, [id])
        await client.query(query_update_computadores, [id])
        //await client.query('COMMIT')
    } catch (err) {
        console.log("error: " + err.message)
        throw new Error(err.message)
    } finally {
        return {
            status_code: 200,
            errors: "Product type updated successfully"
        }
    }
}

module.exports = updatetype