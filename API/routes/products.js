const express = require('express');
const router = express.Router();
const productsControllers = require('../controllers/products');
const checkLogin = require('../middleware/check-user');
const checkVendedorouAdmin = require('../middleware/check-comprador'); //check whether user is a vendedor or admin


router.get('/', checkLogin, productsControllers.getproducts)
router.post('/',checkVendedorouAdmin ,checkVendedorouAdmin, productsControllers.registerproduct)
router.put('/:id', checkVendedorouAdmin, productsControllers.updateproduct)
router.get('/:id', productsControllers.getproduct)


module.exports = router;