const Actions = require('../models/enums/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes } = require('../models/Models')
const Verified = require("../models/enums/Verified.enum");

const Errors = require('../Errors/index.error');
const { Op } = require('sequelize')



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
                //TODO: Maybe error test here!!!!
                const allowedVideo = await AllowedVideos.findOne({
                    where: {
                        videoId: id
                    },
                    include: [{
                        model: Users,
                        as: 'Allower',
                        attributes: ['id'],
                        include: [{
                            //priorit
                            model: Priorities,
                            as: 'Prioritiy',
                            attributes: ['priority', 'GiverId', 'id']
                        }]
                    }]
                })

                const allower = allowedVideo.Allower;

                if (allower.Prioritiy.priority >= user.priority && allower.id !== user.id)
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
            if (!(req.query.tvs ?? req.cookies.tvs))
                return next(new Errors.BadRequestError())

            const time_where = {};
            if (req.query['start-date']) {
                const date = Date.parse(req.query['start-date'])
                if (!date)
                    return next(new Errors.BadRequestError())

                time_where.createdAt = { [Op.gte]: date };
            }

            if (req.query['end-date']) {
                const date = Date.parse(req.query['end-date'])
                if (!date)
                    return next(new Errors.BadRequestError())

                if (!time_where.createdAt)
                    time_where.createdAt = { [Op.lte]: date };
                else {
                    time_where.createdAt = { ...time_where.createdAt, [Op.lte]: date };
                }
            }

            const queryTv = [].concat(req.query['select-tvs']).filter(el => el).map(el => parseInt(el))

            const tvIds = queryTv.length == 0 ? req.cookies.tvs : queryTv

            const condition = {
                ...time_where,
            }

            if (req.query.hasOwnProperty('played')) {
                const played = req.query['played'];
                if (isNaN(played) && played !== 'null')
                    return next(new Errors.BadRequestError())
                condition.played = JSON.parse(req.query['played'])
            }

            const allowedVideos = await AllowedVideos.findAll(
                {
                    where: condition,
                    attributes: ['id', 'votes', 'createdAt', 'played', 'AllowerId'],
                    include: {
                        model: Videos,
                        attributes: ['videoLink'],
                        where: {
                            tvId: {
                                [Op.in]: tvIds
                            }
                        }
                    }
                }
            );
            return res.json({ success: true, allowedVideos })
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
            const video = await AllowedVideos.findByPk(videoId, {
                attributes: ['id', 'votes', 'createdAt'],
                include: {
                    model: Videos,
                    attributes: ['videoLink']
                }
            });

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

}


module.exports = new VideoController()