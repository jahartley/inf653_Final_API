const express = require('express');
const { createUser, loginUser } = require('../../controllers/UserController');

const router = express.Router();

// Per REQ 7.a
router.post('/register', createUser);

// Per REQ 7.b
router.post('/login', loginUser);

module.exports = router;