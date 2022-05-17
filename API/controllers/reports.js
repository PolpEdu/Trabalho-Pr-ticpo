const client = require('../utils/connection.js')

exports.checkyear = (req, res, next) => {

    /* 
    {   
        “status”: status_code,
        “errors”: errors (if any occurs),
        “results”: [
            {“month”: month_0, “total_value”: total_value_orders, “orders”: orders_count},
    (…) ]
    }
*/
    // check order details in the last 12 months from now in one query
    
    const query = `
    SELECT extract(month from time_created) as month, extract(year from time_created) as year, count(*) as orders, sum(total_value) as total_value
    FROM orders
    WHERE extract(year from time_created) = extract(year from now())
    GROUP BY extract(month from time_created), extract(year from time_created)
    ORDER BY extract(month from time_created) ASC
    `;

    
    client.query(query).then(response => {
        return res.status(200).json({
            status_code: 200,
            message: "Success",
            results: response.rows
        });
    }
    ).catch(error => {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            message: 'Internal server error.'
        });
    });
}