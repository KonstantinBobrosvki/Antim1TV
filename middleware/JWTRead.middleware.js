const jwt = require('jsonwebtoken');
const loggerService = require('../services/logger.service');
const Actions = require('../models/enums/Actions.enum');
const JWTService = require('../services/JWT.service');

function JWTRead(req, res, next) {
    res.locals.loggedin = false;

    JWTService.ReadToken(req.cookies['access']).then(decoded => {
        req.user = decoded.user
        res.locals.user = decoded.user
        res.locals.loggedin = true;
        res.locals.Actions = Actions;
        next()
    }).catch(() => {
        res.cookie('access', '', { expires: new Date(0) });

        next()
    })
}

module.exports = JWTRead;