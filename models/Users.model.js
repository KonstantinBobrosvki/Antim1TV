const bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
    let User = sequelize.define('user', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        username: {
            field: 'username',
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },
        email: {
            field: 'email',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            field: 'password',
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return User;
}