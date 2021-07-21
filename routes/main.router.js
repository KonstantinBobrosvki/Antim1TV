const express = require('express');
const router = express.Router();
const JWt_Reader = require('../middleware/JWTRead.middleware');

router.use(JWt_Reader);
router.use(require('./authed.router'));
router.use(require('./public.router'));

module.exports = router;