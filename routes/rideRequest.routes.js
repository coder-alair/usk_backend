const express = require('express');
const requestController = require('../controllers/rideRequest.Controller');

const rideRequestValidator = require('../middlewares/rideRequest.validation.middleware');

const router = express.Router();

router.post('/createRequest', requestController.createRequest);
router.put('/updateRequest', requestController.updateRequest);
router.get('/getRideRequest', requestController.getRequest);
router.get('/get', requestController.getUpdates);
router.get('/getHistory', requestController.getRecentHistory);
router.get('/getUserHistory', requestController.getRecentHistoryUser);

module.exports = router;