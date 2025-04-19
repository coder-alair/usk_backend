const express = require('express');
const templeteController = require('../controllers/templetes.controllers');

const router = express.Router();

router.post('/createTemplete', templeteController.sendMediaMessage);
// router.put('/updateStatus', requestController.updateRequest);
// router.get('/getRideRequest', requestController.getRequest);
module.exports = router;