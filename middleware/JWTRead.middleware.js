const jwt = require('jsonwebtoken');
const loggerService = require('../services/logger.service');
const Actions=require('../models/enums/Actions.enum')
function JWTRead(req, res, next) {
    let token = req.cookies['access']
    res.locals.loggedin = false;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    res.cookie('access', '', { expires: new Date(0) });
                } else {
                    console.log(err)
                }

            } else {
                res.locals.user = decoded.user
                res.locals.loggedin = true;
                res.locals.Actions=Actions;
            }

            next();
        });
    } else {
        next();
    }
}

module.exports = JWTRead;