const express = require('express');
const static = require('../controllers/static.controller.js');


let router = express.Router();

router.get('/', static.GetIndex);

router.all('/403', static.GetUserErrorPage(403));
router.all('/401', static.GetUserErrorPage(401));
router.all('/404', static.GetUserErrorPage(404));
router.all('/500', static.GetBackendErrorPage);
router.all('/*', static.GetUserErrorPage(404))


module.exports = router;