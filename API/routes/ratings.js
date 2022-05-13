const express = require('express');
const router = express.Router();
const ratingsControllers = require('../controllers/ratings');
const checkLogin = require('../middleware/check-user')

router.post("/:id", checkLogin, ratingsControllers.leaveRating);

module.exports = router;