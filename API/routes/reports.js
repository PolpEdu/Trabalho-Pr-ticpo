const express = require('express');
const router = express.Router();
const reportControllers = require('../controllers/reports');
const checkAdmin = require('../middleware/check-admin');

router.get("/year", checkAdmin, reportControllers.checkyear);

module.exports = router;