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
        min: 5,
        acquire: 5000,
        idle: 2000
    },
    logging: false
});

let Users = require('./Users.model')(sequelize, DataTypes);
let Actions = require('./UserActions.model')(sequelize, DataTypes);
let Priorities = require('./UserPriority.model')(sequelize, DataTypes)

Users.hasMany(Actions);
Users.hasOne(Priorities, {
    as: "Receiver",
    onDelete: 'CASCADE',
    foreignKey: {
        allowNull: false,
        unique: true
    }
})
Priorities.belongsTo(Users, { as: "Giver", onDelete: 'SET NULL' })

Sync();
async function Sync() {
    console.log('Synced');
    await sequelize.sync({ force: true })
}
console.log('Imported sequalize');

module.exports = { sequelize, Users, Actions, Priorities };