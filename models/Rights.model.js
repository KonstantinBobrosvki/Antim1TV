const actions = require('./enums/Actions.enum');
const myenum = Object.values(actions);
module.exports = function(sequelize, DataTypes) {
    let Rights = sequelize.define('right', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        actionCode: {
            field: 'actionCode',
            type: DataTypes.STRING,
            validate: {
                isIn: [myenum]
            },
            allowNull: false
        }
    });

    return Rights;
}