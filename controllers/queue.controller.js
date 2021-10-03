const Actions = require('../models/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes } = require('../models/Models')
const Verified = require("../models/Verified.enum");

const Errors = require('../Errors/index.error');
const { AllowVideo } = require('../models/Actions.enum');
const tvService = require('../services/tv.service');

class QueueController {

    async GetChoosePage(req, res, next) {
        const tvs = tvService.GetTvs();
        res.render('tv/chooseTv', {
            title: "Гледай!",
            active: { tv: true },
            tvs
        });
    }

    async GetTvPage(req, res, next) {
        const tvId = req.params.tvId;
        const tvs = tvService.GetTvs();

        if (tvs.some((el) => el.id == tvId))
            res.render('tv/tv', {
                title: "Гледай!",
                active: { tv: true },
                js: ['tv.js'],
                css: ['tv.css'],
                externalJS: ['https://www.youtube.com/player_api'],
                tvId
            });
        else {
            return next(new Errors.NotFoundError());
        }
    }

    async GetNextVideo(req, res, next) {
        if (!res.locals.user.rights.includes(Actions.ControllPlayer)) {
            return next(new Errors.ForbiddenError('Нямате право да контролитате видео-опашката'));
        }

        const tvId = req.params.tvId;

        // null or what position played
        const played = req.body.played
        if (!tvId)
            return next(new Errors.BadRequestError())

        try {
            if (played && Number.isInteger(+played)) {
                const video = await AllowedVideos.findOne({
                    where: {
                        played
                    },
                    attributes: ['id', 'votes', 'createdAt'],
                    include: {
                        model: Videos,
                        attributes: ['videoLink', 'tvId'],
                        where: {
                            tvId
                        }
                    },
                })

                if (video)
                    return res.json({ success: true, video })
                else
                    return next(new Errors.NotFoundError())
            }
            else if (!played) {
                const { count, rows: vids } = await AllowedVideos.findAndCountAll({
                    include: {
                        model: Videos,
                        attributes: ['videoLink', 'tvId'],
                        where: {
                            tvId
                        }
                    },
                    where: {
                        played: null
                    },
                    attributes: ['id', 'votes', 'createdAt'],

                });

                let pretendent = {};

                const now = new Date()
                const millisecondsInHour = 60 * 60 * 1000;

                vids.forEach(el => {
                    const diffInHours = Math.ceil(Math.abs(new Date(el.createdAt) - now) / millisecondsInHour);
                    const value = (1 + el.votes) * Math.sqrt(diffInHours);

                    if (!pretendent.prior) {
                        pretendent = { prior: value, video: el };
                    } else if (pretendent.prior < value) {
                        pretendent = { prior: value, video: el };
                    }

                })

                if (pretendent.video) {

                    await AllowedVideos.update({ played: count }, { where: { id: pretendent.video.id } });
                    return res.json({ video: pretendent.video })
                }

                return next(new Errors.NotFoundError('Няма видеа в опашката'));
            }
            return next(new Errors.BadRequestError())
        } catch (error) {
            return next(new Errors.InternalError('Грешка', error))
        }
    }
}

module.exports = new QueueController();