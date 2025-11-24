const express = require('express');
const router = express.Router();
const controller = require('../controllers/machineController');

router.post('/temperature', controller.setTemperature);
router.post('/defrost', controller.defrost);
router.post('/glass-heating', controller.glassHeating);
router.post('/tempcontroller',controller.enableControler)

module.exports = router;
