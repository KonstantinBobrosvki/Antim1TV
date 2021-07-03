const express = require('express');
require('dotenv').config();

const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const flash = require('connect-flash');

const DBUtils = require('./models/DBUtils.model');

Start();



async function Start() {

    console.log("before DB");
    await DBUtils.Clear();
    console.log("cleared DB");
    await DBUtils.Init();
    console.log("inited DB");

    //TODO: DELETE THIS
    let users = await DBUtils.Query(`SELECT users.username, users.email, users.verifed, users.user_id , roles.name, roles.role_id ,roles.priority
    FROM users
    INNER JOIN users_roles ON users_roles.user_id = users.user_id
    INNER JOIN roles ON users_roles.role_id = roles.role_id
    `, '')

    console.log(users.rows);

    const app = express();



    app.engine('.hbs', exphbs({ extname: '.hbs' }));
    app.set('view engine', '.hbs');

    app.use(express.static('public'));


    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    

    app.use(session({
        store: new pgSession({
            pool : DBUtils.GetPool()                // Connection pool
          }),
        secret: process.env.COOKIE_SECRET,
        resave: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
    }));

    app.use(flash());

    app.use(require('./routes'));



    app.listen(process.env.PORT, () => {
        console.log(`I WORK. Example app listening at http://localhost:${process.env.PORT}`)
    });

}