const { sequelize, Users, Rights, Priorities } = require('../models/Models');
const ActionsEnum = require('../models/Actions.enum');

class RolesService {

    async SetNewbieRole(user) {
        return new Promise(async(resolve, reject) => {
            try {
                let priority = await Priorities.create({ priority: 2, ReceiverId: user.id })

                resolve([
                    [], priority.priority
                ]);
            } catch (error) {
                console.log(error)
                return reject(error);
            }
        });
    }

    async SetStudenttRole(user) {
        return new Promise(async(resolve, reject) => {
            const t = await sequelize.transaction();
            try {
                let [right, priority] = await Promise.all([Rights.create({ ReceiverId: user.id, actionCode: ActionsEnum.Suggest }, { transaction: t }),
                    Priorities.create({ priority: 2, ReceiverId: user.id }, { transaction: t })
                ]);
                await t.commit();
                resolve([
                    [right.actionCode], priority.priority
                ]);
            } catch (error) {
                console.log(error)
                await t.rollback();
                return reject(error);
            }
        });
    }

    async SetJuniorModeratortRole(user, giver) {
        return new Promise(async(resolve, reject) => {
            const t = await sequelize.transaction();
            try {
                let [right1, right2, right3, priority] = await Promise.all([
                    Rights.create({ ReceiverId: user.id, actionCode: ActionsEnum.Suggest, GiverId: giver && giver.id }, { transaction: t }),
                    Rights.create({ ReceiverId: user.id, actionCode: ActionsEnum.AllowVideo, GiverId: giver && giver.id }, { transaction: t }),
                    Rights.create({ ReceiverId: user.id, actionCode: ActionsEnum.AllowAds, GiverId: giver && giver.id }, { transaction: t }),
                    Priorities.create({ priority: 2, ReceiverId: user.id }, { transaction: t })
                ]);
                let rights = [right1, right2, right3].map(item => item.actionCode)
                await t.commit();
                resolve([rights, priority.priority]);
            } catch (error) {
                console.log(error)
                await t.rollback();
                return reject(error);
            }
        });
    }

    //for popping the que
    async SetOperatorRole(user,giver){
        return new Promise(async(resolve, reject) => {
            const t = await sequelize.transaction();
            try {
                let [rights, priority] = await Promise.all([
                    Rights.bulkCreate([
                        { ReceiverId: user.id, actionCode: ActionsEnum.Suggest, GiverId: giver && giver.id },
                        { ReceiverId: user.id, actionCode: ActionsEnum.ControllPlayer, GiverId: giver && giver.id },
                        { ReceiverId: user.id, actionCode: ActionsEnum.AllowVideo, GiverId: giver && giver.id }
                    ],{ transaction: t }),
                    Priorities.create({ priority: 2, ReceiverId: user.id }, { transaction: t })
                ]);
                rights = rights.map(item => item.actionCode)
                console.log(rights);
                await t.commit();
                resolve([rights, priority.priority]);
            } catch (error) {
                console.log(error)
                await t.rollback();
                return reject(error);
            }
        });
    }

    async SetMediumModerator(user,giver){
        return new Promise(async(resolve, reject) => {
            const t = await sequelize.transaction();
            try {
                let [rights, priority] = await Promise.all([
                    Rights.bulkCreate([
                        { ReceiverId: user.id, actionCode: ActionsEnum.Suggest, GiverId: giver && giver.id },
                        { ReceiverId: user.id, actionCode: ActionsEnum.ChangeRight, GiverId: giver && giver.id },
                        { ReceiverId: user.id, actionCode: ActionsEnum.ChangePriority, GiverId: giver && giver.id },
                        { ReceiverId: user.id, actionCode: ActionsEnum.AllowVideo, GiverId: giver && giver.id }
                    ],{ transaction: t }),
                    Priorities.create({ priority: 60, ReceiverId: user.id }, { transaction: t })
                ]);
                rights = rights.map(item => item.actionCode)
                console.log(rights);
                await t.commit();
                resolve([rights, priority.priority]);
            } catch (error) {
                console.log(error)
                await t.rollback();
                return reject(error);
            }
        });
    }

    async SetGodRole(user){
        return new Promise(async(resolve, reject) => {
            const t = await sequelize.transaction();
            try {
                const rightsToAdd=Object.values(ActionsEnum).map((el)=>{ 
                   return{ 
                       ReceiverId: user.id, 
                    actionCode: el}
                 });
                 console.log(rightsToAdd);
                let [rights, priority] = await Promise.all([Rights.bulkCreate(rightsToAdd, { transaction: t }),
                    Priorities.create({ priority: 1000, ReceiverId: user.id }, { transaction: t })
                ]);
                rights = rights.map(item => item.actionCode)
                await t.commit();
                resolve([
                    rights, priority.priority
                ]);
            } catch (error) {
                console.log(error)
                await t.rollback();
                return reject(error);
            }
        });
    }
}

module.exports = new RolesService();