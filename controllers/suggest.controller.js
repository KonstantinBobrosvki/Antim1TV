const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos } = require('../models/Models')
const actions = require('../models/Actions.enum');

const Errors = require('../Errors/index.error');

class SuggestController {
    async GetPage(req, res) {
        res.render('videos', {
            title: "Видеа",
            active: { suggest: true },
            css: ['videos.css'],
            js: ['videos.js'],
            externalJS: ['https://cdn.jsdelivr.net/npm/jquery-validation@1.19.3/dist/jquery.validate.min.js']
        });
    }

    async SuggestVideo(req, res, next) {
        let videoLink = req.body.link;

        if (!videoLink) {
            return next(new Errors.BadRequestError());
        }
        if (!(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(videoLink))) {
            return next(new Errors.BadRequestError("Грешен линк"));
        }
        let suggesterDto = res.locals.user;

        if (!res.locals.user.rights.includes(actions.Suggest))
            return next(new Errors.ForbiddenError("Нямате право да предлагате видео:)"));

        try {
            let videoid = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.exec(videoLink)[5]

            await Videos.create({ videoLink: videoid, SuggesterId: suggesterDto.id })
            return res.json({ success: true })
        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка',error))
        }

    }

}
module.exports = new SuggestController()