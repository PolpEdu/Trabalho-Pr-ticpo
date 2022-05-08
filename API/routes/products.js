const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const productsControllers = require('../controllers/products');
const checkLogin = require('../middleware/check-user');




router.get('/', checkLogin, productsControllers.getproducts)
router.post('/', checkLogin, productsControllers.registerproduct)



module.exports = router;