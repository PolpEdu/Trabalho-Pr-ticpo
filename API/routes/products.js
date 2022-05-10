const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const productsControllers = require('../controllers/products');
const checkLogin = require('../middleware/check-user');
const checkAdmin = require('../middleware/check-admin');
const checkComprador = require('../middleware/check-comprador');




router.get('/', checkLogin, productsControllers.getproducts)
router.post('/', checkComprador, productsControllers.registerproduct)



module.exports = router;