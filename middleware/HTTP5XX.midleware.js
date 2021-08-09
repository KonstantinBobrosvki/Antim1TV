//I know that doesnt work but i will leave it here
function HTTP5XX(req, res, next) {
    try {
        next();
    } catch (error) {
        console.log('ERROR GOT')
        console.error(error.stack)
        console.error(error)
        if (req.accepts('html')) {
            res.status(500).redirect('/500');
        } else
            return res.json({ Errors: ['SERVER ERROR'] });
    }
}

module.exports = HTTP5XX;