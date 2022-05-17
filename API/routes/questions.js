const express = require('express');
const router = express.Router();
const questionsControllers = require('../controllers/questions');
const checkLogin = require('../middleware/check-user')

router.get("/:id", checkLogin, questionsControllers.getQuestions);
router.post("/:id", checkLogin, questionsControllers.perguntar);
router.post("/:idproduct/:parentid", checkLogin, questionsControllers.subquestion);


module.exports = router;