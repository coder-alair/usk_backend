const express = require('express');
const router = express.Router();
const { getRoles, getStates, getDistrictsStates, getHeirarchy, signupAdmin, loginAdmin, getUser, addUser, registerAdmin, submitKyc, getGpnUsers } = require('../controllers/admin.controller');

router.get('/roles', getRoles);
router.get('/states', getStates);
router.get('/districts/:state', getDistrictsStates);
router.get('/hierarchy', getHeirarchy);
router.post('/admin-signup', signupAdmin);
router.post('/admin-login', loginAdmin);
router.get('/get-users/:currentUserId', getUser);
router.post('/add-user', addUser);
router.post('/register', registerAdmin);
router.put('/kyc-submit', submitKyc);
router.get('/get-drivers',getGpnUsers);

module.exports = router;