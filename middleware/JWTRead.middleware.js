const jwt = require('jsonwebtoken')

function JWTRead(req, res, next) {
    let token = req.cookies['access']
    res.locals.loggedin = false;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
            if (err) {
                console.log(err)
            } else {
                res.locals.user = decoded.user
                res.locals.loggedin = true;
            }

            next();
        });
    } else {
        next();
    }
}

module.exports = JWTRead;