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
    // get the total cost of an order of orders last year by calling a procedure
    // check get the orders of the year, divided by months and the total value of the orders
    const query = `
    SELECT
        EXTRACT(MONTH FROM order_date) AS month,
        get_total_price(order_id) AS total_value,
        COUNT(*) AS orders
        FROM orders WHERE order_date > (NOW() - INTERVAL '12 months')
        GROUP BY EXTRACT(MONTH FROM order_date) ORDER BY EXTRACT(MONTH FROM order_date) ASC`

    
    client.query(query).then(response => {
        return res.status(200).json({
            status_code: 200,
            message: "Fetched last 12 months of orders!",
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