const express = require('express');


const config= require('./config.js');

const app = express();

const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');

app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(express.static('public'));
app.use(flash());

app.use(session({
	secret: config.Cookie_secret,
	resave: true,
	saveUninitialized: false,
    cookie: {
        //12 hours
        maxAge: 12 * 60 * 60 * 1000
    }
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

let port= process.env.PORT || config.app.port

app.listen( port ,()=>{
    console.log(`I WORK. Example app listening at http://localhost:${port}`)
});