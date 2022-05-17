const client = require('../utils/connection.js')

exports.perguntar = (req, res, next) => {
    /*
    * {
    *   "question": "How do you turn it on?", // obrigatorio
    *   "description": "I have a problem with the power switch, how do I turn it on?" //nao obrigatorio
    * }
    */

    //insert on main thread the main question of the product
    const { id } = req.params;
    const nif = parseInt(req.userData.nif);

    const { question, description } = req.body;
    
    if (!question) {
        return res.status(400).json({
            status_code: 400,
            error: "Please provide a question",
        });
    }


    client.query(
        `INSERT INTO thread (main_pergunta, time_created, description, products_id, users_nif) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [question, new Date(), description, id, nif]).then(response => {
            return res.status(201).json({
                status_code: 201,
                message: "Thread created!",
                thread: response.rows[0],
            });
        }
    ).catch(error => {
        console.log(error);
        if(error.code === '23505'){
            return res.status(400).json({
                status_code: 400,
                error: "Something went wrong with the parameters choosen, please select a valid product and question",
                error_detail: error.detail
            });
        }
        return res.status(500).json({
            status_code: 500,
            message: 'Internal server error.'
        });
    });
   
}

exports.subquestion = async (req, res, next) => {
    const { idproduct, parentid } = req.params;
    const nif = parseInt(req.userData.nif);

    const { question, description } = req.body;

    console.log(idproduct, parentid)

    if (!question) {
        return res.status(400).json({
            status_code: 400,
            error: "Please provide a question",
        });
    }
    try {
        //first check if question exists for this product
        const response = await client.query(`SELECT * FROM thread WHERE products_id = $1 AND id = $2`, [idproduct, parentid]);
        if (response.rows.length === 0) {
            return res.status(400).json({
                status_code: 400,
                error: "This question doesn't exist for this product",
            });
        }
        
        //insert on main thread the main question of the product
        client.query(
            `INSERT INTO reply (text, description, thread_id, users_nif) VALUES ($1, $2, $3, $4) RETURNING *`
            , [question, description, parentid, nif]).then(response => {
                return res.status(201).json({
                    status_code: 201,
                    message: "Reply created!",
                    reply: response.rows[0],
                });
            }
        ).catch(error => {
            console.log(error);
            if (error.code === '23505') {
                return res.status(400).json({
                    status_code: 400,
                    error: "Something went wrong with the parameters choosen, please select a valid product and question",
                    error_detail: error.detail
                });
            }
            return res.status(500).json({
                status_code: 500,
                message: 'Internal server error.'
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            message: 'Internal server error.'
        });
    }
}

exports.getQuestions = async (req, res, next) => {
    const { id } = req.params;

    try {
        const response = await client.query(`SELECT * FROM thread WHERE products_id = $1`, [id]);

        // get all replies for each question
        const questions = response.rows.map(async (question) => {
            const response = await client.query(`SELECT * FROM reply WHERE thread_id = $1`, [question.thread_id]);
            return {
                ...question,
                replies: response.rows
            }
        });

        return res.status(200).json({
            status_code: 200,
            message: "Questions retrieved!",
            data:questions,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            message: 'Internal server error.'
        });
    }
}
