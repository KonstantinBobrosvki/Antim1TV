const express = require('express');
const router = express.Router();


router.use(require('../middleware/JWTRead.middleware'));
router.use(require('./authed.router'));
router.use(require('./public.router'));
router.use(require('./errors.router'));
router.use(require('../middleware/HTTP5XX.midleware'))

module.exports = router;