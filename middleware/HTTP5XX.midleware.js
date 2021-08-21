const Logger = require('../services/logger.service')

function HTTP5XX(err, req, res, next) {

    console.log('ERROR GOT')
    Logger.Error(err)
    if (req.accepts('html')) {
        res.status(500).redirect('/500');
    } else
        res.json({ Errors: ['SERVER ERROR'] });

}

module.exports = HTTP5XX;