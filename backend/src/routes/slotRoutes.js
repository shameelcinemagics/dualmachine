const express = require('express');
const router = express.Router();
const controller = require('../controllers/slotController');
const { getPlanogram } = require('../db/client');

// router.get('/', controller.getSlots);
// router.post('/', controller.createSlot);
router.post('/test', controller.testSingleSlot);
// router.delete('/',controller.deleteSlots)
router.post('/testall',controller.testAllSlots);
router.get('/api/products',(req,res)=>{
    const data = getPlanogram();
    res.json(data);
})
// router.put("/:id", controller.updateSlot);

module.exports = router;
