const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    pool: {
        max: 19,
        min: 0,
        acquire: 60000,
        idle: 5000
    },
    logging: false
});

let Users = require('./Users.model')(sequelize, DataTypes);
let Roles = require('./Roles.model')(sequelize, DataTypes);
let RolesLogs = require('./RolesLogs.model')(sequelize, DataTypes);

Users.hasOne(RolesLogs, { as: 'User' });
RolesLogs.belongsTo(Users, { as: 'Giver' });
RolesLogs.belongsTo(Roles, {
    foreignKey: 'roleId'
});

Users.belongsTo(Roles, {
    foreignKey: 'roleId'
});

module.exports = { sequelize, Users, Roles, RolesLogs };