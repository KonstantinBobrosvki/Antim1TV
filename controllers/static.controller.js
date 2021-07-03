//Controller for static pages

class StaticController {
    
    GetIndex(req, res) {
        res.render('index', {
            title: "Начало",
            active: { index: true },
            loggedin: req.session?.user?.loggedin,
            js: ['index.js'],
            css: ['index.css'],
            externalJS: ['https://www.youtube.com/player_api'],
            messages: { Errors:req.flash('error' ) }
        });
    }

}

module.exports = new StaticController();