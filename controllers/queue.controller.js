const Actions = require('../models/enums/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes } = require('../models/Models')

const { Op } = require('sequelize')

const Errors = require('../Errors/index.error');
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
        const tv = tvs.find((el) => el.id == tvId)
        if (tv)
            res.render('tv/tv', {
                title: "Гледай!",
                active: { tv: true },
                js: ['tv/tv.js'],
                css: ['tv.css'],
                externalJS: ['https://cdn.socket.io/4.2.0/socket.io.min.js','https://www.youtube.com/player_api'],
                tv
            });
        else {
            return next(new Errors.NotFoundError());
        }
    }

    async GetNewestVideo(req, res, next) {
        if (!res.locals.user.rights.includes(Actions.ControllPlayer)) {
            return next(new Errors.ForbiddenError('Нямате право да контролитате видео-опашката'));
        }

        const tvId = req.params.tvId;

        if (!tvId)
            return next(new Errors.BadRequestError())

        try {

            let [vids, count] = await Promise.all([AllowedVideos.findAll({
                include: {
                    model: Videos,
                    attributes: ['videoLink', 'tvId', 'createdAt'],
                    where: {
                        tvId
                    }
                },
                where: {
                    played: null
                },
                attributes: ['id', 'votes', 'createdAt']
            }), AllowedVideos.max('played', {
                include: {
                    model: Videos,
                    attributes: [],
                    where: {
                        tvId
                    }
                }
            })]);

            count = ++count || 1;

            const now = new Date()
            const millisecondsInHour = 60 * 60 * 1000;

            const getWeight = (Allowedvideo) => {
                const diffInHours = Math.ceil(Math.abs(new Date(Allowedvideo.video.createdAt) - now) / millisecondsInHour);
                return (1 + Allowedvideo.votes) * Math.sqrt(diffInHours);
            }
            vids.sort((a, b) => {
                return getWeight(b) - getWeight(a)
            })

            vids.forEach(el => console.log('url: ' + el.video.videoLink + ' weight' + getWeight(el)));

            const pretendent = vids[0]
            if (pretendent) {
                pretendent.played = count;

                await pretendent.save();
                console.log(JSON.stringify(pretendent));
                return res.json({ video: pretendent })
            }

            return next(new Errors.NotFoundError('Няма видеа в опашката'));

        } catch (error) {
            return next(new Errors.InternalError('Грешка', error))
        }
    }

    async GetPlayedVideo(req, res, next) {

        const tvId = req.params.tvId;

        // null or what position played
        const played = req.query.played

        if (!(tvId && played))
            return next(new Errors.BadRequestError())

        const video = await AllowedVideos.findOne({
            where: {
                played
            },
            attributes: ['id', 'votes', 'createdAt', 'played'],
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
}

module.exports = new QueueController();