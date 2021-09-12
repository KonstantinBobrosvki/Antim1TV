const express = require('express');
const account = require('../controllers/account.controller.js')

let router = express.Router();

router.get('/',function(req,res) {
    res.redirect(req.baseUrl+'/me')
})
router.get('/me', account.GetMyAccountPage)
router.get('/allows', account.GetAllowsPage)

module.exports = router;