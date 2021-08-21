const express = require('express');
const static = require('../controllers/static.controller.js');


let errors_router = express.Router();

errors_router.all('/403', static.GetUserErrorPage(403));
errors_router.all('/401', static.GetUserErrorPage(401));
errors_router.all('/404', static.GetUserErrorPage(404));
errors_router.all('/500', static.GetBackendErrorPage);





module.exports = errors_router;