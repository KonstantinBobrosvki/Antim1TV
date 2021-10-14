const express = require('express');
const router = express.Router();
const CheckAuth = require('../middleware/CheckAuth.middleware')

router.use(require('../middleware/JWTRead.middleware'));

router.use('/videos', CheckAuth, require('./videos.router'))
router.use('/suggest', CheckAuth, require('./suggest.router'))
router.use('/account', CheckAuth, require('./account.router'))
router.use('/tv', CheckAuth, require('./tv.router'))


router.use('/enter', require('./enter.router'))
router.use('/', require('./static.router'));


router.use(require('../middleware/ErrorHandler.midleware'))

module.exports = router;