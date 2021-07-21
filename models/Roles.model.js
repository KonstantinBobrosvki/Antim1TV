module.exports = function(sequelize, DataTypes) {
    let Role = sequelize.define('role', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        tag: {
            field: 'tag',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        priority: {
            field: 'priority',
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        mutable: {
            field: 'mutable',
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });

    return Role;
}