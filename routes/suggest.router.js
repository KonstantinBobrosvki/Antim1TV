const SuggestController = require('../controllers/suggest.controller');

const express = require('express');
let router = express.Router();

router.get('/', SuggestController.GetPage);
router.post('/video', SuggestController.SuggestVideo);


module.exports = router;