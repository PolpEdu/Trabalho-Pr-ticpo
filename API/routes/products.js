const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const productsControllers = require('../controllers/products');
const checkLogin = require('../middleware/check-user');
const checkAdmin = require('../middleware/check-admin');
const checkVendedorouAdmin = require('../middleware/check-comprador'); //check whether user is a vendedor or admin




router.get('/', checkLogin, productsControllers.getproducts)
router.post('/', checkVendedorouAdmin, productsControllers.registerproduct)
router.patch('/:id', checkVendedorouAdmin, productsControllers.updateproduct)



module.exports = router;