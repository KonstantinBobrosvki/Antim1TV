const Actions = require('../models/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos } = require('../models/Models')
const Verified = require("../models/Verified.enum");

class VideoController {
    async AllowVideo(req, res, next) {
        //id of allowed video
        let id = req.body.id;
        let user = res.locals.user;

        if (user.rights.includes(Actions.AllowVideo)) {

            const t = await sequelize.transaction();
            Promise.all([AllowedVideos.create({ AllowerId: user.id, VideoId: id }, { transaction: t }),
                Videos.update({ verified: Verified.allowed }, { where: { id } }, { transaction: t })
            ]).then(async() => {
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
}

module.exports = new VideoController()