const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const productsControllers = require('../controllers/products');




router.get('/', productsControllers.getproducts)
router.post('/', productsControllers.registerproduct)



module.exports = router;