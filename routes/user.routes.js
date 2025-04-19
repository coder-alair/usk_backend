const express = require('express');
const router = express.Router();
const { validateSignUp, validateLogin, validateUpdateDetails } = require("../middlewares/validationRequest.middlewares");
const {signUp, login, getDriverDetails, updateDetails} =  require('../controllers/users.controller')

console.log("Hereee");
router.post('/signup', validateSignUp, signUp);
router.post('/signin', validateLogin, login);
router.get('/getDriver', getDriverDetails);
router.put('/update', validateUpdateDetails, updateDetails);

module.exports = router;