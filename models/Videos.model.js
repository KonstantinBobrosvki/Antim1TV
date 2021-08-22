const Verified = require("./Verified.enum");
const VerifiedValues = Object.values(Verified);

module.exports = function(sequelize, DataTypes) {
    let Videos = sequelize.define('video', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        //this is youtube video id
        videoLink: {
            field: 'videoLink',
            type: DataTypes.STRING,
            allowNull: false
        },
        verified: {
            field: 'verified',
            type: DataTypes.STRING,
            validate: {
                isIn: [VerifiedValues]
            },
            allowNull: true
        }
    });

    return Videos;
}