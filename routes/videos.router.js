const express = require('express');
const VideoController = require('../controllers/video.controller')
const router = express.Router();

router.post('/allow', VideoController.AllowVideo);
router.post('/reject', VideoController.RejectVideo)
router.get('/getAllowedVideos', VideoController.GetAllowedVideos)
router.post('/vote', VideoController.VoteVideo)

module.exports = router;