const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userControllers = require('../controllers/users');




//router.get('/logout', userControllers.logout)

router.post("/", userControllers.signup);

// router.post("/login", userControllers.login);
/*
router.delete("/signout", userControllers.signout);
*/
module.exports = router;