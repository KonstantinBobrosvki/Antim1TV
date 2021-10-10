const express = require('express');
const queue = require('../controllers/queue.controller.js')

const router = express.Router();

router.get('/', queue.GetChoosePage);
router.get('/:tvId', queue.GetTvPage)
router.post('/:tvId/GetNewestVideo', queue.GetNewestVideo)
router.get('/:tvId/GetPlayedVideo', queue.GetPlayedVideo)


module.exports = router;