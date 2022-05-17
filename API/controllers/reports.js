const client = require('../utils/connection.js')

exports.checkyear = (req, res, next) => {

    /* 
    {   
        “status”: status_code,
        “errors”: errors (if any occurs),
        “results”: [
            {“month”: month_0, “total_value”: total_value_orders, “orders”: orders_count},
    (…)
    ]}
*/
    // check order details in the last 12 months from now in one query

    const query = `
    SELECT
        EXTRACT(MONTH FROM time_created) AS month,
        SUM(total_value) AS total_value,
        COUNT(*) AS orders
    FROM orders
    WHERE EXTRACT(YEAR FROM time_created) = EXTRACT(YEAR FROM NOW())
    GROUP BY EXTRACT(MONTH FROM time_created)
    ORDER BY EXTRACT(MONTH FROM time_created) ASC
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