const express = require('express');
const static = require('../controllers/static.controller.js');
const auth = require('../controllers/auth.controller')

let public_router = express.Router();

public_router.get('/', static.GetIndex);

public_router.get('/enter', auth.GetAuthPage)
public_router.post('/enter/login', auth.Login)
public_router.post('/enter/signup', auth.SignUp)

module.exports = public_router;