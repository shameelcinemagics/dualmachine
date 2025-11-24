const express = require('express');
const router = express.Router();
const controller = require('../controllers/signageController');

router.get('/', controller.getSignage);

module.exports = router;
