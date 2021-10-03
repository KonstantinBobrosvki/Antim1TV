module.exports = function (sequelize, DataTypes) {
    const tv = sequelize.define('tv', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            field: 'name',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });

    return tv;
}