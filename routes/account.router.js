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
router.get('/logout',account.Logout)

router.post('/changePriorityUp', account.ChangePriority(1))
router.post('/changePriorityDown', account.ChangePriority(-1))

router.post('/deleteRight', account.DeleteRight)
router.post('/addRight', account.AddRight)

router.post('/setTvCookies',account.SetTvCookies)

router.post('/changePassword',account.ChangePassword)
router.post('/deleteUser',account.DeleteAccount)

module.exports = router;