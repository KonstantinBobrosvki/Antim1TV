const actions = require('./Actions.enum');
const myenum = Object.values(actions);
module.exports = function(sequelize, DataTypes) {
    let Action = sequelize.define('action', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        actionCode: {
            field: 'actionCode',
            //Sequalize wants strings
            type: DataTypes.ENUM(myenum),
            allowNull: false
        }
    });

    return Action;
}