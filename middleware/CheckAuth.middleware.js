const Errors = require('../Errors/index.error');

function CheckAuth(req, res, next) {

    if (res.locals.loggedin == false) {
       next(new Errors.UnauthorizedError())
    } else {
        next();
    }

}

module.exports = CheckAuth;