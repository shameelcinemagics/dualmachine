const express = require('express');
const router = express.Router();
const {updateSystem} = require('../controllers/updateController')

// POST /update
router.post("/", updateSystem);

module.exports = router;