const express = require('express');
const router = express.Router();
const planogram = require('../controllers/planogramController')

router.post('/',planogram.fetchplano)

module.exports = router;