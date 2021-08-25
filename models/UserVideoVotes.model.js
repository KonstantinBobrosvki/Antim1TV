//Thath links user with votes for videos
module.exports = function(sequelize, DataTypes) {
    let UserVideoVotes = sequelize.define('UserVideoVote', {
        videoId: {
            field: 'videoId',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        userId: {
            field: 'userId',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        }
    });

    return UserVideoVotes;
}