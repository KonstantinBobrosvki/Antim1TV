const express = require('express');
require('dotenv').config();

const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser')
const cors = require('cors')

const { sequelize, Users, Roles } = require('./models/Models');

Start();



async function Start() {

    const app = express();


    app.engine('.hbs', exphbs({
        extname: '.hbs',
        helpers: require('./views/helpers/helpers') //only need this
    }));
    app.set('view engine', '.hbs');

    app.use(express.static('public'));

    app.use(cookieParser())
    app.use(cors())

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json())

    await sequelize.sync({ alter: true });

    await TestFill();

    app.use(require('./routes/main.router'));



    app.listen(process.env.PORT, () => {
        console.log(`I WORK. Example app listening at http://localhost:${process.env.PORT}`)
    });

}

async function TestFill() {
    return;
    await Roles.create({ tag: 'Участник', priority: 2, mutable: false })
    await Roles.create({ tag: 'Главен администратор', priority: 1000, mutable: false })
    await Roles.create({ tag: 'Старши модератор', priority: 500, mutable: false })
    await Roles.create({ tag: 'Модератор', priority: 300, mutable: false })
    await Roles.create({ tag: 'Учител', priority: 100, mutable: false })
    await Roles.create({ tag: 'Депутат', priority: 50, mutable: false })
    await Roles.create({ tag: 'Система', priority: 20, mutable: false })
}