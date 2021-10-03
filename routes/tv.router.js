const express = require('express');
const queue = require('../controllers/queue.controller.js')

const router = express.Router();

router.get('/', queue.GetChoosePage);
router.get('/:tvId', queue.GetTvPage)
router.post('/:tvId/GetNextVideo', queue.GetNextVideo)

module.exports = router;