const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/users');


router.post("/", userControllers.signup);

router.put("/", userControllers.login);

module.exports = router;