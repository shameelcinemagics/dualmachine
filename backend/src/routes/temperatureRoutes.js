const express = require('express');
const router = express.Router();
const temperatureController = require('../controllers/temperatureControll')

router.post('/', temperatureController.setTemperature);
router.get('/',temperatureController.readTemperature)

module.exports = router;
