//Controller for static pages

class StaticController {

    GetIndex(req, res) {
        res.render('index', {
            title: "Начало",
            active: { index: true },
            js: ['index.js'],
            css: ['index.css'],
            externalJS: ['https://www.youtube.com/player_api'],
        });
    }

}

module.exports = new StaticController();