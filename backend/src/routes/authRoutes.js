const express = require('express');
const { registerVictim, login, registerOfficer } = require('../controllers/authController');

const router = express.Router();

router.post('/register/victim', registerVictim);
router.post('/register/officer', registerOfficer); // In real app, restricted to Admin
router.post('/login', login);

module.exports = router;
