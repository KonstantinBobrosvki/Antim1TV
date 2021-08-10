function CheckAuth(req, res, next) {

    if (res.locals.loggedin == false) {
        if (req.accepts('html')) {
            res.status(401).redirect('/401');
        } else
            return res.json({ Errors: ['Не сте влезли'] });

    }

    next();

}

module.exports = CheckAuth;