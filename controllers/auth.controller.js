const { sequelize, Users, Rights, Priorities, RestoreLink } = require('../models/Models');
const { Sequelize } = require('sequelize');

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const JwtService = require('../services/JWT.service');
const rolesService = require('../services/roles.service');
const tvService = require('../services/tv.service');

const Errors = require('../Errors/index.error');
const Actions = require('../models/enums/Actions.enum');
const MailService = require('../services/Mail.service');


class AuthController {

    async GetAuthPage(req, res) {
        res.render('auth/enter', {
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
        user.email = user.email.toLowerCase()
        try {
            let new_user = await Users.create(user);
            try {
                let [rights, priority] = await rolesService.SetNewbieRole(new_user)

                let access = await JwtService.CreateAccessToken({ user: new_user, rights, priority }, '6h');
                res.cookie('access', access, {
                    secure: true,
                    httpOnly: true,
                    expires: new Date(Date.now() + 6 * 60 * 60000),
                });


                res.cookie('tvs', tvService.GetDefaults().map(tv => tv.id), {
                    //10 years
                    expires: new Date(Date.now() + 315569520000)
                })

                MailService.SendWelcomeMail({ to: user.email, username: user.username }).catch(err => console.log(err)).finally(() => {
                    return res.json({ success: true })
                })


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

    async Login(req, res, next) {

        let body = req.body;

        if (!body.usernameOrEmail) {
            return next(new Errors.BadRequestError())
        }

        let where = {}

        if (IsAllowedEmail(body.usernameOrEmail)) {
            where.email = body.usernameOrEmail.toLowerCase();

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
                const rights_mapped = user.Rights.map(item => item.actionCode)
                let expires;
                if (rights_mapped.includes(Actions.ControllPlayer)) {
                    //TODO: REMOVE THAT S**T so migrate to refresh token
                    expires = 10000000000;
                }
                else {
                    expires = 3600000 * 6;
                }

                let access = await JwtService.CreateAccessToken({ user: user, rights: rights_mapped, priority: user.Prioritiy.priority }, expires);
                res.cookie('access', access, {
                    secure: true,
                    httpOnly: true,
                    //60000 for one minute 60 for one hour 48 for two days
                    expires: new Date(Date.now() + expires),
                });

                //TODO:Change to user preferences
                res.cookie('tvs', tvService.GetDefaults().map(tv => tv.id), {
                    //10 years
                    maxAge: 315569520000
                })


                return res.json({ success: true })

            } else {
                return next(new Errors.BadRequestError("Грешка в паролата"))
            }
        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка', error))
        }

    }

    async SendSecretMail(req, res, next) {

        const mail = req.query['email']?.toLowerCase();
        if (!mail)
            return next(new Errors.BadRequestError());

        if (!IsAllowedEmail(mail))
            return next(new Errors.BadRequestError());


        try {
            const user = await Users.findOne({
                where: {
                    email: mail
                }
            })
            if (user) {
                const address = req.protocol + '://' + req.get('host');

                const cryptoPromise = new Promise((resolve, reject) => {
                    crypto.randomBytes(64, (err, buffer) => {
                        if (err) {
                            reject(err)
                        }
                        else
                            resolve(buffer)
                    })
                })

                const secret = (await cryptoPromise).toString("hex");

                const [restor, created] = await RestoreLink.findOrCreate({
                    where: {
                        userId: user.id
                    },
                    defaults: {
                        relativeLink: secret
                    }
                })

                if (!created) {
                    const ress = await RestoreLink.update({ relativeLink: secret }, {
                        where: {
                            userId: user.id
                        }
                    });
                }

                const secretLink = address + '/enter/secretCode?value=' + secret

                await MailService.SendRestorePasswordmail({ to: user.email, name: user.username, link: secretLink })
                return res.json({ success: true })
            }
            return next(new Errors.NotFoundError('Няма такъв потребител'))

        } catch (error) {
            return next(new Errors.InternalError('', error))
        }

    }

    async GetRestorePasswordPage(req, res, next) {
        const link = req.query['value'];
        if (!link)
            return next(new Errors.BadRequestError());

        try {
            const restore = await RestoreLink.findOne({
                where: {
                    relativeLink: link
                }
            })

            if (!restore)
                return next(new Errors.NotFoundError());

            const newDateObj = restore.updatedAt.getTime() + 10 * 60000;

            if (newDateObj < Date.now())
                return next(new Errors.ForbiddenError('Закъсняхте. Опитайте отново'));

            const user = await Users.findOne({
                where: {
                    id: restore.userId
                },
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

            if (!user)
                return next(new Errors.NotFoundError('Не намерихме такъв потрбител... Странно'))

            const rights_mapped = user.Rights.map(item => item.actionCode)
            let expires=10 * 60000;

            let access = await JwtService.CreateAccessToken({ user: user, rights: rights_mapped, priority: user.Prioritiy.priority }, expires);
            res.cookie('access', access, {
                secure: true,
                httpOnly: true,
                //60000 for one minute 60 for one hour 48 for two days
                expires: new Date(Date.now() + expires),
            });

            //TODO:Change to user preferences
            res.cookie('tvs', tvService.GetDefaults().map(tv => tv.id), {
                //10 years
                maxAge: 315569520000
            })

            await restore.destroy();

            res.render('auth/restorePassword', {
                title: "Here we go again",
                active: { account: true },
                css: ['enter.css'],
                js: ['auth/restoreAccount.js'],
               
            });
        } catch (error) {
            return next(new Errors.InternalError('', error))
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