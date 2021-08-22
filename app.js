const express = require('express');
require('dotenv').config();
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser')
const cors = require('cors')

//Inits db
const db = require('./models/Models');

StartApp();



async function StartApp() {

    const app = express();


    app.engine('.hbs', exphbs({
        extname: '.hbs',
        helpers: require('./views/helpers/helpers'), //only need this
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true

        },
    }));
    app.set('view engine', '.hbs');

    app.use(express.static('public'));

    app.use(cookieParser())
    app.use(cors())

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json())

    app.use(require('./routes/main.router'));
    app.use(require('./middleware/HTTP5XX.midleware'));

    app.listen(process.env.PORT, () => {
        console.log(`I WORK. Example app listening at http://localhost:${process.env.PORT}`)
    });

}