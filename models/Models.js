const { Sequelize, DataTypes } = require('sequelize');

const { sequelize } = require('./sequlize')

let Users = require('./Users.model')(sequelize, DataTypes);
let Rights = require('./Rights.model')(sequelize, DataTypes);
let Priorities = require('./UserPriority.model')(sequelize, DataTypes)
let Videos = require('./Videos.model')(sequelize, DataTypes);
let AllowedVideos = require('./AllowedVideos.model')(sequelize, DataTypes);
let UserVideoVotes = require('./UserVideoVotes.model')(sequelize, DataTypes);
let Tvs = require('./tv.model')(sequelize, DataTypes);
let RestoreLink = require('./RestoreLink.model')(sequelize, DataTypes)
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

Videos.belongsTo(Tvs, { onDelete: 'CASCADE' })

AllowedVideos.belongsTo(Users, { as: "Allower", onDelete: 'CASCADE' })
AllowedVideos.belongsTo(Videos, { onDelete: 'CASCADE' })

UserVideoVotes.belongsTo(AllowedVideos, { foreignKey: 'videoId', onDelete: 'CASCADE' })
UserVideoVotes.belongsTo(Users, { foreignKey: 'userId', onDelete: 'CASCADE' })

RestoreLink.belongsTo(Users, {
    foreignKey: 'userId'
    ,onDelete: 'CASCADE'
})

console.log('Imported sequalize');

module.exports = { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes, Tvs, RestoreLink };