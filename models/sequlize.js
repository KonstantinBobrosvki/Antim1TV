const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
            rejectUnauthorized: false
        }
    },
    pool: {
        max: 19,
        min: 5,
        acquire: 5000,
        idle: 2000
    },
    logging: false
});

async function Sync() {

    await sequelize.sync({ alter: true })

    console.log('Synced');

}

module.exports = { sequelize, Sync };