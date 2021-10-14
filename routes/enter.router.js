const express = require('express');

const auth = require('../controllers/auth.controller')

let router = express.Router();

router.get('/sendSecretMail', auth.SendSecretMail)
router.get('/secretCode', auth.GetRestorePasswordPage)

router.get('/', auth.GetAuthPage)

router.post('/login', auth.Login)
router.post('/signup', auth.SignUp)

module.exports = router;