const { sequelize, Users, Rights, Priorities } = require('../models/Models');
const { Sequelize } = require('sequelize');

const bcrypt = require('bcrypt');

const JwtService = require('../services/JWT.service');
const rolesService = require('../services/roles.service');

const Errors = require('../Errors/index.error');

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
            return next(new Errors.BadRequestError())
        }
        if (!IsAllowedEmail(user.email)) {
            return next(new Errors.BadRequestError("Грешка в email. Позволени са само 'gmail.com', 'abv.bg', 'yandex.ru', 'yahoo.com'"))
        }
        if (user.username.length < 5 || user.username.length >= 30) {
            return next(new Errors.BadRequestError("Грешка в името. Трябва да е по-дълго от 5 символа и по кратко от 30 символа"))
        }

        let new_psw = await bcrypt.hash(user.password, 10)
        user.password = new_psw;
        try {
            let new_user = await Users.create(user);
            try {
                let [rights, priority] = await rolesService.SetNewbieRole(new_user)

                let access = await JwtService.CreateAccessToken({ user: new_user, rights, priority },'6h');
                res.cookie('access', access, {
                    secure: true,
                    httpOnly: true,
                    expires: new Date(Date.now() + 48 * 60 * 60000),
                });
                return res.json({ success: true })

            } catch (error) {
                console.error(error)
                await new_user.destroy();
                return next(error)
            }
        } catch (error) {
            if (error instanceof Sequelize.UniqueConstraintError) {
                return next(new Errors.BadRequestError("Името или email са заети"))
            } else {
                next(Errors.InternalError('Неизвестна грешка', error))
            }
        }
    }

    async Login(req, res,next) {

        let body = req.body;

        if (!body.usernameOrEmail) {
            return next(new Errors.BadRequestError())
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
                return next(new Errors.BadRequestError("Няма такъв потребител"))

            }

            let compare_result = await bcrypt.compare(body.password, user.password)

            if (compare_result === true) {
                let access = await JwtService.CreateAccessToken({ user: user, rights: user.Rights.map(item => item.actionCode), priority: user.Prioritiy.priority },'6h');
                res.cookie('access', access, {
                    secure:true,
                    httpOnly: true,
                    //60000 for one minute 60 for one hour 48 for two days
                    expires: new Date(Date.now() + 48 * 60 * 60000),
                });
                return res.json({ success: true })

            } else {
                return next(new new Errors.BadRequestError("Грешка в паролата"))
            }
        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка', error))
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