//Controller for static pages
const CodesText = {
    '401': {
        Title: "Не сте влезли",
        Bottom: "Моля влезнете в акакунта си"
    },
    '403': {
        Title: "Нямате достатъчно ниво на достъп",
        Bottom: "Някой друг път madam/bro"
    },
    '404': {
        Title: "Страницата не е намерена",
        Bottom: "Пробвай друг адрес"
    }
}
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

    GetUserErrorPage(errorCode) {
        return function(req, res) {

            let codeInfo = CodesText[errorCode] || { Title: "Неизвестна грешка", Bottom: "Нз брато ко стана" };
            res.status(errorCode).render('errors/' + errorCode, {
                title: codeInfo.Title,
                errorCode,
                errorText: codeInfo.Title,
                js: ['errorpage.js'],
                css: ['errorpage.css'],
                externalJS: ['https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js'],
            });
        }
    }

    GetBackendErrorPage(req, res) {
        res.status(500).render('errors/500', {
            title: "Ah shit",
            js: ['500error.js'],
            css: ['500error.css'],
            externalJS: []
        });
    }

}

module.exports = new StaticController();