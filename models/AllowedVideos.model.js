module.exports = function(sequelize, DataTypes) {
    let AllowedVideos = sequelize.define('allowedVideo', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        votes: {
            field: 'votes',
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        played: {
            field: 'played',
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }

    });

    return AllowedVideos;
}