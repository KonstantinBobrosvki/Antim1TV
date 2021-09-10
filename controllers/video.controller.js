const Actions = require('../models/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes } = require('../models/Models')
const Verified = require("../models/Verified.enum");

//Here will be stored all hashed allowed videos
let AllowedVideosHash = []

HashVideos()
setTimeout(HashVideos, 60000 * 10)

class VideoController {

    async AllowVideo(req, res, next) {
        //id of allowed video
        let id = req.body.id;
        let user = res.locals.user;

        if (user.rights.includes(Actions.AllowVideo)) {

            const t = await sequelize.transaction();
            Promise.all([AllowedVideos.create({ AllowerId: user.id, videoId: id }, { transaction: t }),
            Videos.update({ verified: Verified.allowed }, { where: { id } }, { transaction: t })
            ]).then(async () => {
                await t.commit();
                res.json({ success: true });
            }).catch(async error => {
                await t.rollback();
                next(error)
            });


        } else {
            return res.json({ Errors: ["Нямате право да одобрявате видео:)"] })
        }
    }

    async RejectVideo(req, res, next) {

        //id of deleting video
        let id = req.body.id;
        let user = res.locals.user;

        if (user.rights.includes(Actions.AllowVideo)) {
            try {
                await Videos.update({ verified: Verified.rejected }, { where: { id } });
                res.json({ success: true });
            } catch (error) {

                return res.json({ Errors: ["Има грешка:("] })

            }
        } else {
            return res.json({ Errors: ["Нямате право да правите това:)"] })
        }
    }

    async GetAllowedVideos(req, res, next) {
        res.json(AllowedVideosHash);
    }

    async VoteVideo(req, res, next) {
        const user = res.locals.user;
        //allowed video id
        const videoId = req.body.videoId;

        const hashed = AllowedVideosHash.find(el => el.id == videoId)
        if (!hashed) {
            return res.json({ Errors: ['Няма такова видео'] })

        }

        const t = await sequelize.transaction();
        try {


            const [vote, created] = await UserVideoVotes.findOrCreate({
                where: { userId: user.id, videoId: videoId },
                transaction: t
            });
            if (created) {
                const video = await AllowedVideos.findByPk(videoId);
                if (!video) {
                    return res.json({ Errors: ['Няма такова видео'] })
                } else {
                    await video.increment('votes', { by: 1, transaction: t });
                    await t.commit();
                    hashed.votes++;
                    res.json({ success: true })
                }
            } else {
                return res.json({ Errors: ['Вече гласувахте'] })

            }

        } catch (error) {
            await t.rollback();
            next(error)
        }
    }

    //Get video that should be viewed next
    async PopVideo(req, res, next) {
        if (!res.locals.user.rights.includes(Actions.ControllPlayer)) {
            return res.json({ Errors: ['NQMATE PRAVA 111!!!'] })
        }

        let pretendent = {};

        const now = new Date()
        const millisecondsInHour = 60 * 60 * 1000;
        let iter = 0;
        AllowedVideosHash.forEach(el => {
            const diffInHours = Math.ceil(Math.abs(new Date(el.createdAt) - now) / millisecondsInHour);
            const value = 1 + el.votes * Math.sqrt(diffInHours);

            if (pretendent.prior || 0 < value) {
                pretendent = { index: iter, prior: value, video: el };
            }
            iter++;
        })

        if (pretendent.video) {

            AllowedVideosHash.splice(pretendent.index, 1)
            await AllowedVideos.update({ played: true }, { where: { id: pretendent.video.id } });
            return res.json({ video: pretendent.video })
        }
        return res.json({ Errors: ['Няма видеа в опашката'] })


    }
}

async function HashVideos() {
    AllowedVideosHash = await AllowedVideos.findAll({
        where: { played: false },
        raw: true,
        attributes: ['id', 'votes', 'createdAt'],
        nest: true,
        include: {
            model: Videos,
            attributes: ['videoLink']
        },
        limit: 30

    })
}

module.exports = new VideoController()