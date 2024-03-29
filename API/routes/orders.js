const express = require('express');
const router = express.Router();
const ordersControllers = require('../controllers/orders');
const checkLogin = require('../middleware/check-user')

router.post("/", checkLogin, ordersControllers.buyproduct);

module.exports = router;