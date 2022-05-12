const express = require('express');
const router = express.Router();
const ordersControllers = require('../controllers/orders');


router.post("/", ordersControllers.buyproduct);

module.exports = router;