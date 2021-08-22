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
let Rights = require('./Rights.model')(sequelize, DataTypes);
let Priorities = require('./UserPriority.model')(sequelize, DataTypes)
let Videos = require('./Videos.model')(sequelize, DataTypes);
let AllowedVideos = require('./AllowedVideos.model')(sequelize, DataTypes);

//I know that is shit
Rights.belongsTo(Users, {
    as: "Receiver",
    onDelete: 'CASCADE',
    foreignKey: {
        allowNull: false,
    }
})
Users.hasMany(Rights, { as: 'Rights', foreignKey: 'ReceiverId' })

Rights.belongsTo(Users, { as: "Giver", onDelete: 'CASCADE' })

//one to one
Priorities.belongsTo(Users, {
    as: "Receiver",
    onDelete: 'CASCADE',
    foreignKey: {
        allowNull: false,
        unique: true
    }
})
Users.hasOne(Priorities, { as: 'Prioritiy', foreignKey: 'ReceiverId' })

//one to many
Priorities.belongsTo(Users, { as: "Giver", onDelete: 'CASCADE' })

//one to many
Videos.belongsTo(Users, { as: "Suggester", onDelete: 'CASCADE' })
Videos.hasOne(AllowedVideos, { onDelete: 'CASCADE' })

AllowedVideos.belongsTo(Users, { as: "Allower", onDelete: 'CASCADE' })
AllowedVideos.belongsTo(Videos, { onDelete: 'CASCADE' });

Sync();
async function Sync() {
    await sequelize.sync({ alter: true })
    console.log('Synced');
}
console.log('Imported sequalize');

module.exports = { sequelize, Users, Rights, Priorities, Videos, AllowedVideos };