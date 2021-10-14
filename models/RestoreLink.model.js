module.exports = function (sequelize, DataTypes) {
    let RestoreLink = sequelize.define('RestoreLink', {
        relativeLink: {
            type: DataTypes.STRING(65),
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: true,
        }
    });

    return RestoreLink;
}