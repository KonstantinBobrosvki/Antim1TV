const express = require('express');
require('dotenv').config();

const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser')
const cors = require('cors')

//Inits db
const db = require('./models/Models');

WrapControllers();
StartApp();



async function StartApp() {

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

    app.use(require('./routes/main.router'));

    app.listen(process.env.PORT, () => {
        console.log(`I WORK. Example app listening at http://localhost:${process.env.PORT}`)
    });

}

//Wraps to prevent errors
function WrapControllers() {

    function Wrap(fn) {
        return function(req, res) {
            try {
                return fn(req, res);
            } catch (ex) {
                if (req.accepts('html')) {
                    res.status(500).redirect('/500');
                } else
                    return res.json({ Errors: ['SERVER ERROR'] });
            }
        };
    }

    let normalizedPath = require("path").join(__dirname, "controllers");
    const standartMethods = ['constructor', '__defineGetter__', '__defineSetter__', 'hasOwnProperty', '__lookupGetter__', '__lookupSetter__', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'valueOf', 'toLocaleString']
    require("fs").readdirSync(normalizedPath).forEach(function(file) {

        let controller = require("./controllers/" + file);

        let currentObj = controller
        do {
            Object.getOwnPropertyNames(currentObj).filter(item => typeof currentObj[item] === 'function').forEach(item => {
                if (!standartMethods.includes(item)) {

                    currentObj[item] = Wrap(currentObj[item])
                }
            })
        } while ((currentObj = Object.getPrototypeOf(currentObj)))

    });
}