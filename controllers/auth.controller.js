const { sequelize, Users, Rights, Priorities } = require('../models/Models');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const JwtService = require('../services/JWT.service');
const rolesService = require('../services/roles.service');

class AuthController {

    async GetAuthPage(req, res) {
        res.render('enter', {
            title: "Влезни",
            active: { account: true },
            css: ['enter.css'],
            js: ['enterFront.js'],
            externalJS: ['https://cdn.jsdelivr.net/npm/jquery-validation@1.19.3/dist/jquery.validate.min.js']
        });

    }

    async SignUp(req, res, next) {

        let user = req.body;

        if (!user.username || !user.email || !user.password) {
            return res.json({ Errors: ["Грешка в тялото на request"] })
        }
        if (!IsAllowedEmail(user.email)) {
            return res.json({ Errors: ["Грешка в email. Позволени са само 'gmail.com', 'abv.bg', 'yandex.ru', 'yahoo.com'"] })
        }
        if (user.username.length < 5 || user.username.length >= 30) {
            return res.json({ Errors: ["Грешка в името. Трябва да е по-дълго от 5 символа и по кратко от 30 символа"] })
        }

        let new_psw = await bcrypt.hash(user.password, 10)
        user.password = new_psw;
        try {
            let new_user = await Users.create(user);
            try {
                let [rights, priority] = await rolesService.SetJuniorModeratortRole(new_user)

                let access = await JwtService.CreateAccessToken({ user: new_user, rights, priority });
                res.cookie('access', access, {
                    secure: process.env.NODE_ENV !== "development",
                    httpOnly: true,
                    expires: new Date(Date.now() + 60 * 60000),
                });
                return res.json({ success: true })

            } catch (error) {
                console.error(error)
                await new_user.destroy();
                return next(error)
            }
        } catch (error) {
            console.log('ERROR')
            if (error instanceof Sequelize.UniqueConstraintError) {
                return res.json({ Errors: ["Името или email са заети"] })
            } else {
                console.log(error)
                return res.json({ Errors: ["Неизвестна грешка"] })
            }
        }
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
        try {
            let user = await Users.findOne({
                where,
                include: [{
                        model: Rights,
                        as: 'Rights'
                    },
                    {
                        model: Priorities,
                        as: 'Prioritiy'
                    }
                ]
            });
            if (!user) {
                return res.json({ Errors: ["Няма такъв потребител"] })
            }

            let compare_result = await bcrypt.compare(body.password, user.password)

            if (compare_result === true) {
                let access = await JwtService.CreateAccessToken({ user: user, rights: user.Rights.map(item => item.actionCode), priority: user.Prioritiy.priority });
                res.cookie('access', access, {
                    secure: process.env.NODE_ENV !== "development",
                    httpOnly: true,
                    expires: new Date(Date.now() + 60 * 60000),
                });
                return res.json({ success: true })

            } else {
                return res.json({ Errors: ["Грешка в паролата"] })
            }
        } catch (error) {
            return next(error)
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