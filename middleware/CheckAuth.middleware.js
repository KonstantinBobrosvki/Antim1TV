/**
 * 
 * @param {int} min_priority min priority to do http's skip for minimum auth
 * @returns JSon to client or do next middleware
 */
function CheckAuth(min_priority) {

    if (arguments.length != 1)
        min_priority = 2;

    return function(req, res, next) {
        if (res.locals.loggedin == false) {
            if (req.accepts('html')) {} else
                return res.json({ Errors: ['Не сте влезли'] });

        } else if (res.locals.role.Priority < min_priority) {
            return res.json({ Errors: ['Недостатъчно ниво на достъп'] });
        } else {
            next();
        }

    }
}

module.exports = CheckAuth;