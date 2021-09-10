const express = require('express');
const CheckAuth = require('../middleware/CheckAuth.middleware')
const account = require('../controllers/account.controller.js')
const SuggestController = require('../controllers/suggest.controller');
const VideoController = require('../controllers/video.controller')
let authed_router = express.Router();

authed_router.get('/suggest', CheckAuth, SuggestController.GetPage);
authed_router.get('/account', CheckAuth, account.GetPage)
authed_router.post('/suggest/suggestVideo', CheckAuth, SuggestController.SuggestVideo);
authed_router.post('/videos/allow', CheckAuth, VideoController.AllowVideo);
authed_router.post('/videos/reject', CheckAuth, VideoController.RejectVideo)
authed_router.get('/videos/getVideos', CheckAuth, VideoController.GetAllowedVideos)
authed_router.post('/videos/vote', CheckAuth, VideoController.VoteVideo)
authed_router.post('/videos/popQueue', CheckAuth, VideoController.PopVideo)

module.exports = authed_router;