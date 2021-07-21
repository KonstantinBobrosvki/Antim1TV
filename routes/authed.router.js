const express = require('express');
const CheckAuth = require('../middleware/CheckAuth.middleware')
const account = require('../controllers/account.controller.js')

let authed_router = express.Router();

authed_router.get('/account', CheckAuth(), account.GetPage)

module.exports = authed_router;