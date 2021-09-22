const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos } = require('../models/Models')

const { Op } = require('sequelize')
const Errors = require('../Errors/index.error');

const Actions = require('../models/Actions.enum');

class AccountController {

    async GetMyAccountPage(req, res, next) {
        try {

            const myVideos = await Videos.findAll({ where: { SuggesterId: res.locals.user.id } })
            const myRights = res.locals.user.rights;
            res.render('account/me', {
                title: "Мой аккаунт",
                active: { account: true },
                css: ['account.css'],
                js: ['account.js'],
                myVideos,
                myRights,
                myPriority: res.locals.user.priority
            });

        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка', error))
        }
    }

    async Logout(req, res, next) {
        res.clearCookie('access', {
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 6 * 60 * 60000),
        });
        res.redirect('/')
    }

    async GetAllowsPage(req, res, next) {
        try {
            let user = res.locals.user;

            if (user.rights.includes(Actions.AllowVideo)) {
                const [videosToAllow, allowedVideos] = await Promise.all([
                    Videos.findAll({
                        where: { verified: null }
                    }),
                    AllowedVideos.findAll({
                        where: { },
                        attributes: ['id', 'votes', 'createdAt'],
                        include: {
                            model: Videos,
                            attributes: ['videoLink','id']
                        },
                        order: [
                            ["createdAt", "DESC"]
                        ],
                        limit: 40

                    })
                ]);
                res.render('account/allow', {
                    title: "Одобри контент",
                    active: { account: true },
                    css: ['account.css'],
                    js: ['account.js'],
                    videosToAllow,
                    allowedVideos
                });
            } else {
                next(new Errors.ForbiddenError())
            }
        } catch (error) {
            next(new Errors.InternalError('Неизвестна грешка', error))
        }
    }

    async GetUsersPage(req, res, next) {
        const me = res.locals.user;

        const myRights = me.rights;

        if (!(myRights.includes(Actions.ChangePriority) || myRights.includes(Actions.ChangeRight) || myRights.includes(Actions.BanUser))) {
            return next(new Errors.ForbiddenError('Нямате права да контролирате акаунтите'))
        }

        res.render('account/users', {
            title: "Потребители",
            active: { account: true },
            css: ['account.css'],
            js: ['users.js'],
            externalJS: ['https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.7/handlebars.min.js']
        });
        /* let user = await Users.findOne({
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
        */


    }

    async GetByName(req, res, next) {
        const me = res.locals.user;

        const myRights = me.rights;

        if (!(myRights.includes(Actions.ChangePriority) || myRights.includes(Actions.ChangeRight) || myRights.includes(Actions.BanUser))) {
            return next(new Errors.ForbiddenError('Нямате права да контролирате акаунтите'))
        }
        if (!req.query.username) {
            return next(new Errors.BadRequestError())
        }

        const include = [{
            model: Priorities,
            as: 'Prioritiy',
            attributes: ['priority', 'GiverId', 'id'],
            where: {
                priority: { [Op.lt]: parseInt(me.priority) }
            }
        }];


        if (myRights.includes(Actions.ChangeRight)) {
            include.push({
                model: Rights,
                as: 'Rights',
                attributes: ['actionCode', 'GiverId', 'id']

            })
        }

        let users;

        if (/^id=/.test(req.query.username)) {
            users = await Users.findAll({
                where: {
                    id: req.query.username.slice(3)
                },
                include,
                attributes: ['username', 'id']

            })
            if (users.length == 0)
                return next(new Errors.NotFoundError('Този потребител не е намерен.Може би има по-висок от вас приоритет'))
        }
        else {
            users = await Users.findAll({
                where: {
                    username: {
                        [Op.like]: req.query.username + '%'
                    }
                },
                include,
                attributes: ['username', 'id']

            })
        }


        res.json(users)

    }


    /**
     * @param  {int} changeCount How should priority be changed
     */
    ChangePriority(changeCount) {
        return async function (req, res, next) {
            try {
                const me = res.locals.user;

                const myRights = me.rights;

                if (!myRights.includes(Actions.ChangePriority)) {
                    return next(new Errors.ForbiddenError('Нямате правo да променяте приоритет'))
                }


                if (!(req.body.id && !isNaN(req.body.id)))
                    return next(new Errors.BadRequestError());

                const priorityId = parseInt(req.body.id);
                const priority = await Priorities.findByPk(priorityId)

                if (!priority) {
                    return next(new Errors.NotFoundError('Няма приоритет с това id'))
                }
                if (priority.priority + changeCount <= 0) {
                    return next(new Errors.BadRequestError('Приоритет не може да е по-малък или равен от 0'))
                }
                if (priority.priority >= me.priority - 1) {
                    return next(new Errors.ForbiddenError('Нямате достатъчно приоритет за тази операция'))
                }
                if (priority.GiverId) {
                    const giver = await Priorities.findOne({
                        where: {
                            'ReceiverId': priority.GiverId
                        }
                    })
                    if (giver && giver.priority >= me.priority && giver.ReceiverId != me.id) {
                        return next(new Errors.ForbiddenError('Нямате достатъчно приоритет за тази операция'))
                    }
                }
                const t = await sequelize.transaction();
                Promise.all([priority.increment('priority', { by: changeCount, transaction: t }),
                Priorities.update({ GiverId: parseInt(me.id) }, {
                    where: {
                        id: priorityId
                    }, transaction: t
                })]).then(([incr, giv]) => {
                    t.commit()
                    res.json({ success: true, new_priority: incr.priority })
                }).catch(error => {
                    t.rollback();
                    return next(new Errors.InternalError('Неизвестна грешка', error))
                });
            } catch (error) {
                next(new Errors.InternalError('Неизвестна грешка', error))
            }

        }
    }

    async DeleteRight(req, res, next) {
        try {
            const me = res.locals.user;

            const myRights = me.rights;

            if (!myRights.includes(Actions.ChangeRight)) {
                return next(new Errors.ForbiddenError('Нямате правo да променяте права'))
            }

            const rightId = +req.body['right_id']
            const userId = +req.body['user_id']

            if (!(rightId && !isNaN(rightId)) && !(userId && !isNaN(userId)))
                return next(new Errors.BadRequestError());

            const receiver = await Users.findByPk(userId, {
                include: [{
                    model: Priorities,
                    as: 'Prioritiy',
                    attributes: ['priority', 'GiverId', 'id']
                }]
            });

            if (!receiver)
                return next(new Errors.NotFoundError('Нямате потребител с това право'))

            if (receiver.Prioritiy.priority >= me.priority)
                return next(new Errors.ForbiddenError('Нямате правo да променяте правата на този потребител'))

            const right = await Rights.findByPk(rightId, {
                include: [{
                    //giver of right
                    model: Users,
                    as: 'Giver',
                    attributes: ['id'],
                    include: [{
                        //priority of giver of right
                        model: Priorities,
                        as: 'Prioritiy',
                        attributes: ['priority', 'GiverId', 'id']
                    }]
                }]
            })

            if (right) {
                if (right.Giver.Prioritiy.priority >= me.priority && right.Giver.id !== me.id)
                    return next(new Errors.ForbiddenError('Нямате правo да триете това право.'))
                else {
                    await right.destroy();
                    res.json({ success: true })

                }
            }

        } catch (error) {
            return next(new Errors.InternalError('Грешка', error))
        }
    }

    async AddRight(req, res, next) {

        try {
            const me = res.locals.user;

            const myRights = me.rights;

            if (!myRights.includes(Actions.ChangeRight)) {
                return next(new Errors.ForbiddenError('Нямате правo да променяте права'))
            }

            const rightCode = req.body['right_code']
            const userId = +req.body['user_id']

            if (!(rightCode) && !(userId && !isNaN(userId)))
                return next(new Errors.BadRequestError());

            if (!myRights.includes(rightCode))
                return next(new Errors.ForbiddenError('За да даденете право на някого трябва да имате това право'));


            const receiver = await Users.findByPk(userId, {
                include: [{
                    model: Priorities,
                    as: 'Prioritiy',
                    attributes: ['priority', 'GiverId', 'id']
                }]
            });

            if (!receiver)
                return next(new Errors.NotFoundError('Нямате потребител с това право'))

            if (receiver.Prioritiy.priority >= me.priority)
                return next(new Errors.ForbiddenError('Нямате правo да променяте правата на този потребител'))

            const [right, created] = await Rights.findOrCreate({
                where: {
                    ReceiverId: userId,
                    actionCode: rightCode
                },
                defaults: {
                    GiverId: me.id
                }
            });

            if (!created)
                return next(new Errors.BadRequestError('Потребителя вече има това право'))


            res.json({
                success: true,
                result: {
                    user: { id: userId },
                    actionCode: rightCode,
                    id: right.id,
                    GiverId: me.id
                }
            })
        } catch (error) {
            return next(new Errors.InternalError('Грешка', error))
        }
    }

}
module.exports = new AccountController()