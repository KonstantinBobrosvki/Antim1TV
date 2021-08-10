const { sequelize, Users } = require('../models/Models');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const RolesService = require('../services/roles.service');
const JwtService = require('../services/JWT.service');
const rolesService = require('../services/roles.service');

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

        let new_psw = await bcrypt.hash(user.password, 10)
        user.password = new_psw;
        try {

            let new_user = await Users.create(user);
            try {
                await rolesService.SetStudenttRole(new_user)

                let access = await JwtService.CreateAccessToken(new_user);
                res.cookie('access', access, {
                    secure: process.env.NODE_ENV !== "development",
                    httpOnly: true,
                    expires: new Date(Date.now() + 60 * 60000),
                });
                return res.json({ success: true })

            } catch (error) {
                console.error(error)
                await new_user.destroy();
                return res.redirect('/500');
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

        let user = await Users.findOne({ raw: true, where });
        if (!user) {
            return res.json({ Errors: ["Няма такъв потребител"] })
        }

        let compare_result = await bcrypt.compare(body.password, user.password)

        if (compare_result === true) {
            let access = await JwtService.CreateAccessToken(user);
            res.cookie('access', access, {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                expires: new Date(Date.now() + 60 * 60000),
            });
            return res.json({ success: true })

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