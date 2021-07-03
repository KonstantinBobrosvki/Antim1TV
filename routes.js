var express = require('express');
var router = express.Router();
var static=require('./controllers/static.controller.js');
var enter=require('./controllers/enter.controller.js')


router.get('/', static.GetIndex);
router.get('/enter',enter.GetPage)
router.post('/enter/login',enter.Login)
router.post('/enter/signup',enter.SignUp)

module.exports=router;