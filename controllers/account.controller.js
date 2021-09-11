const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos } = require('../models/Models')
const Actions = require('../models/Actions.enum');
class AccountController {
    async GetMyAccountPage(req, res, next) {
        try {
            let [myVideos, rights] = await Promise.all([
                Videos.findAll({ where: { SuggesterId: res.locals.user.id } }),
                Rights.findAll({
                    where: { ReceiverId: res.locals.user.id },
                    attributes: [`actionCode`],
                    raw: true,
                    limit: Object.keys(Actions).length
                })
            ])
            rights = rights.map(item => item.actionCode)

            let renderObj = {
                title: "Аккаунт",
                active: { account: true },
                css: ['account.css'],
                js: ['account.js'],
                myVideos
            }

            if (rights.includes(Actions.AllowVideo)) {
                let videosToAllow = await Videos.findAll({ where: { verified: null } });
                renderObj.videosToAllow = videosToAllow;
            }

            res.render('account', renderObj);
        } catch (error) {
            next(error)
        }
    }

}
module.exports = new AccountController()