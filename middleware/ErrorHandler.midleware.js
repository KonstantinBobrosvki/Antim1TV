const Logger = require('../services/logger.service')
const Errors = require('../Errors/index.error')

function ErrorHandler(error, req, res, next) {

    //If i tried to handle
    if (error instanceof Errors.StandartError) {
        if (req.accepts('html')) {
            res.redirect('/'+error.code);
        } else
            res.status(error.code).json({ Errors: error.errors })

    } else {
        Logger.Error(error)
        return res.status(500).json({ Errors: ['Няма информация за грешката'] })
    }

}

module.exports = ErrorHandler;