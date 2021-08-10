const { sequelize, Users, Actions, Priorities } = require('../models/Models');
const ActionsEnum = require('../models/Actions.enum');

class RolesService {
    async SetStudenttRole(user) {
        return new Promise(async(resolve, reject) => {
            const t = await sequelize.transaction();
            try {
                await Promise.all([user.createAction({ actionCode: ActionsEnum.Suggest }, { transaction: t }),
                    Priorities.create({ priority: 2, ReceiverId: user.id }, { transaction: t })
                ]);
                await t.commit();
                resolve(true);
            } catch (error) {
                console.log(error)
                await t.rollback();
                return reject(error);
            }
        });
    }
}

module.exports = new RolesService();