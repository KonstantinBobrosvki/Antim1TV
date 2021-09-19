const express = require('express');
const account = require('../controllers/account.controller.js')

let router = express.Router();

router.get('/', function (req, res) {
    res.redirect(req.baseUrl + '/me')
})
router.get('/me', account.GetMyAccountPage)
router.get('/allows', account.GetAllowsPage)
router.get('/users', account.GetUsersPage)
router.get('/getByName', account.GetByName)

router.post('/changePriorityUp', account.ChangePriority(1))
router.post('/changePriorityDown', account.ChangePriority(-1))

router.post('/deleteRight', account.DeleteRight)
router.post('/addRight', account.AddRight)

module.exports = router;