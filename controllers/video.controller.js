const Actions = require('../models/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes } = require('../models/Models')
const Verified = require("../models/Verified.enum");

const Errors = require('../Errors/index.error');
const { AllowVideo } = require('../models/Actions.enum');

class VideoController {

    async AllowVideo(req, res, next) {
        //id of allowed video
        const id = req.body.id;
        const user = res.locals.user;
        if (!id) {
            return next(new Errors.BadRequestError());
        }
        if (user.rights.includes(Actions.AllowVideo)) {

            //TODO: check if video is allowed or rejected
            const t = await sequelize.transaction();
            Promise.all([AllowedVideos.create({ AllowerId: user.id, videoId: id }, { transaction: t }),
            Videos.update({ verified: Verified.allowed }, { where: { id } }, { transaction: t })
            ]).then(async () => {
                await t.commit();
                res.json({ success: true });
            }).catch(async error => {
                await t.rollback();
                next(new Errors.InternalError('Неизвестна грешка', error))
            });


        } else {
            return next(new Errors.ForbiddenError("Нямате право да одобрявате видео:)"));
        }
    }

    async RejectVideo(req, res, next) {

        //id of deleting video
        let id = req.body.id;
        let user = res.locals.user;

        if (!user.rights.includes(Actions.AllowVideo)) {
            return next(new Errors.ForbiddenError("Нямате право да правите това:)"));
        }

        try {
            const video = await Videos.findByPk(id);
            if (!video)
                return next(new Errors.BadRequestError('Няма видео с това id'))

            if (video.verified === null) {
                video.verified = Verified.rejected;
                await video.save();
                return res.json({ success: true });
            }
            else if (video.verified === Verified.rejected) {
                return next(new Errors.BadRequestError('Видеото вече е премахнато'))
            }
            else {
                //if video verifed is true
                //TODO: IMPROVE HERE!!!!
                const allowedVideo = await AllowedVideos.findOne({
                    where: {
                        videoId: id
                    },
                    include: [{
                        model: Users,
                        as: 'Allower',
                        attributes: ['id'],
                        include: [{
                            //priority of giver of right
                            model: Priorities,
                            as: 'Prioritiy',
                            attributes: ['priority', 'GiverId', 'id']
                        }]
                    }]
                })

                const allower = allowedVideo.Allower;

                if (allower.Prioritiy.priority >= user.priority && allower.id!== user.id)
                    return next(new Errors.BadRequestError('Нямате достатАчно приоритет'))

                video.verified = Verified.rejected;
                const t = await sequelize.transaction();

                try {
                    await Promise.all([
                        allowedVideo.destroy({ transaction: t }),
                        video.save({ transaction: t })
                    ])

                    await t.commit();

                    return res.json({ success: true })
                } catch (error) {
                    await t.rollback();
                    return next(new Errors.InternalError('', error))
                }

            }

        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка', error))
        }

    }

    async GetAllowedVideos(req, res, next) {
        try {
            const vids = await GetVideos();
            return res.json(vids);
        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка', error))

        }

    }

    //TODO: Add check for priority
    async VoteVideo(req, res, next) {
        const user = res.locals.user;
        //allowed video id
        const videoId = req.body.videoId;
        try {
            const vids = await GetVideos();

            const video = vids.find(el => el.id == videoId)
            if (!video) {
                return next(new Errors.BadRequestError('Няма такова видео'));
            }

            const t = await sequelize.transaction();
            try {

                const [vote, created] = await UserVideoVotes.findOrCreate({
                    where: { userId: user.id, videoId: videoId },
                    transaction: t
                });
                if (created) {
                    await video.increment('votes', { by: 1, transaction: t });
                    await t.commit();

                    res.json({ success: true })

                } else {
                    return next(new Errors.ForbiddenError('Вече гласувахте'));
                }

            } catch (error) {
                await t.rollback();
                next(new Errors.InternalError('Неизвестна грешка', error))
            }
        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка', error))

        }

    }

    //Get video that should be viewed next
    async PopVideo(req, res, next) {
        if (!res.locals.user.rights.includes(Actions.ControllPlayer)) {
            return next(new Errors.ForbiddenError('Нямате право да контролитате видео-опашката'));
        }

        try {
            const vids = await GetVideos();
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

                await AllowedVideos.update({ played: true }, { where: { id: pretendent.video.id } });
                return res.json({ video: pretendent.video })
            }

            return next(new Errors.NotFoundError('Няма видеа в опашката'));
        } catch (error) {

        }

    }
}

async function GetVideos() {
    return AllowedVideos.findAll({
        where: { played: false },
        attributes: ['id', 'votes', 'createdAt'],
        include: {
            model: Videos,
            attributes: ['videoLink']
        },
        order: [
            ["createdAt", "DESC"]
        ],
        limit: 30

    })
}

module.exports = new VideoController()