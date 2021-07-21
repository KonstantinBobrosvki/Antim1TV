const { sequelize, Users, Roles } = require('../models/Models');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const RolesService = require('../services/roles.service');
const JwtService = require('../services/JWT.service');
class AuthController {

    async GetAuthPage(req, res) {
        res.render('enter', {
            title: "Влезни",
            active: { account: true },
            css: ['enter.css'],
            js: ['enterFront.js'],
            externalJS: ['https://cdn.jsdelivr.net/npm/jquery-validation@1.19.3/dist/jquery.validate.min.js'],
        });

    }

    async SignUp(req, res) {

        let user = req.body;

        if (!user.username || !user.email || !user.password) {
            return res.json({ Errors: ["Грешка в тялото на request"] })
        }
        if (!IsAllowedEmail(user.email)) {
            return res.json({ Errors: ["Грешка в email. Позволени са само 'gmail.com', 'abv.bg', 'yandex.ru', 'yahoo.com'"] })
        }
        if (user.username.length <= 5) {
            return res.json({ Errors: ["Грешка в името. Трябва да е по-дълго от 5 символа"] })
        }


        user.password = await bcrypt.hash(user.password, 10)

        Users.create(user).then(async function(new_user) {
            let [upd_user, role] = await RolesService.GiveStandartRole(new_user);
            delete upd_user.password
            let access = await JwtService.CreateAccessToken(upd_user, role);
            return res.json({ success: true, access })
        }).catch(err => {
            if (err instanceof Sequelize.UniqueConstraintError) {
                return res.json({ Errors: ["Името или email са заети"] })
            } else {
                console.log(err)
                return res.json({ Errors: ["Неизвестна грешка"] })
            }

        });
    }

    async Login(req, res) {

        let body = req.body;

        if (!body.usernameOrEmail) {
            return res.json({ Errors: ["Грешка в тялото на request"] })
        }

        let where = {}

        if (IsAllowedEmail(body.usernameOrEmail)) {
            where.email = body.usernameOrEmail
        } else {
            where.username = body.usernameOrEmail
        }

        let user = await Users.findOne({ where, include: Roles });
        if (!user) {
            return res.json({ Errors: ["Няма такъв потребител"] })
        }
        let password_check = await user.ValidatePassword(body.password)
        if (password_check === true) {
            let access = await JwtService.CreateAccessToken(user, user.role);
            return res.json({ success: true, access })

        } else {
            return res.json({ Errors: ["Грешка в паролата"] })
        }
    }
}

const allowedEmails = ['gmail.com', 'abv.bg', 'yandex.ru', 'yahoo.com']

function IsAllowedEmail(email) {

    if (typeof email !== 'string')
        return false

    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let domain = email.split("@")[1]

    return allowedEmails.includes(domain) && regex.test(email)

}

module.exports = new AuthController();