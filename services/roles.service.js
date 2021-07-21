const { sequelize, Users, Roles, RolesLogs } = require('../models/Models');
let StandartRole;
Init()

async function Init() {
    StandartRole = await Roles.findOne({
        where: {
            mutable: false,
            priority: 2
        }
    });

    if (!StandartRole) {
        console.log("NO STANDART ROLE")
        throw new Error("NO STANDART ROLE");
    }
    //console.log(StandartRole)

}



class RolesService {
    async GiveStandartRole(user) {
        user.roleId = StandartRole.id;

        try {
            await Promise.all([user.save(), RolesLogs.create({ UserId: user.id, GiverId: null, roleId: StandartRole.id })])
            return [user, StandartRole];
        } catch (error) {
            console.error(error);
            throw error;
        }



    }
}

module.exports = new RolesService();