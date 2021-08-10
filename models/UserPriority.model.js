module.exports = function(sequelize, DataTypes) {
    let Priority = sequelize.define('priority', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        priority: {
            field: 'priority',
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    return Priority;
}