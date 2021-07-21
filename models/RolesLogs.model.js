module.exports = function(sequelize, DataTypes) {
    let RoleLog = sequelize.define('RolesLog', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        }
    });

    return RoleLog;
}