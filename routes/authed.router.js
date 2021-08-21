const express = require('express');
const CheckAuth = require('../middleware/CheckAuth.middleware')
const account = require('../controllers/account.controller.js')
const SuggestController = require('../controllers/suggest.controller');
const VideoController = require('../controllers/video.controller')
let authed_router = express.Router();
//authed_router.use(CheckAuth);
const wrap = fn => (...args) => {
    console.log('here')
    console.log(args[2] + '')
    return fn(...args).catch(args[2])
}

authed_router.get('/suggest', CheckAuth, SuggestController.GetPage);
authed_router.get('/account', CheckAuth, account.GetPage)
authed_router.post('/suggest/suggestVideo', CheckAuth, SuggestController.SuggestVideo);
authed_router.post('/videos/allow', CheckAuth, VideoController.AllowVideo);
authed_router.post('/videos/reject', CheckAuth, VideoController.RejectVideo)

module.exports = authed_router;