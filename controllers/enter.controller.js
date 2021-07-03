const UsersDB = require('../models/Users.model');
const bcrypt = require('bcrypt');
const UserDTO = require('../DTOs/user.dto');

class EnterController {
    async GetPage(req, res) {
        res.render('enter', {
            title: "Влезни",
            active: { account: true },
            css: ['enter.css'],
            js: ['enterFront.js'],
            externalJS: ['https://cdn.jsdelivr.net/npm/jquery-validation@1.19.3/dist/jquery.validate.min.js'],
            messages: { Errors: req.flash('error' ) },
            loggedin: req.session?.user?.loggedin
        });
    }
    async SignUp(req, res) {
        let user = req.body;

        if (!user.username || !user.email) {
            req.flash('error', "Грешка в тялото на request")
            res.redirect('/enter');
            return;
        }
        if(!IsAllowedEmail(user.email)){

            req.flash('error',"Грешка в email. Позволени са само 'gmail.com', 'abv.bg', 'yandex.ru', 'yahoo.com'")
            res.redirect('/enter');
            return;
        }
        if(user.username.length<=5){

            req.flash('error', "Грешка в името. Трябва да е по-дълго от 5 символа")
            res.redirect('/enter');
            return;
        }
        if(await UsersDB.ContainsCredits(user)){
            req.flash('error',"Името или email са заети")
            res.redirect('/enter');
            return;
        }
        console.log("check done");

        let hash=await bcrypt.hash(user.password,10)

        user.password=hash;
        console.log("hash done");
        let results= await UsersDB.AddUser(user)
        if(results!=false){


            req.session.user = new UserDTO( user);
            req.session.user.loggedin=true;

            res.redirect('/account');
        }else{
            
            req.flash('error', "Грешка в тялото на request")
            res.redirect('/enter');
            
            return;
        }

       
    }

    async Login(req, res) {

        let body = req.body;
        if (!body.usernameOrEmail) {
            req.flash('error',"Грешка в тялото на request")
            res.redirect('/enter');
            return;
        }
        let credits = {}

        if (IsAllowedEmail(body.usernameOrEmail)) {
            credits.email = body.usernameOrEmail
        } else {
            credits.username = body.usernameOrEmail
        }

        let user = await UsersDB.GetUser(credits);
        if (!user) {
            req.flash('error', "Грешка в данните. Опитайте отново")
            res.redirect('/enter');
            return;
        }
        let password_check= await bcrypt.compare(body.password,user.password)
        if(password_check===true){
           
            req.session.user =new UserDTO( user);
            req.session.user.loggedin=true;
            res.redirect('/account')
        }else{
            req.flash('error',"Грешка в данните. Опитайте отново")
            res.redirect('/enter');
            return;
        }
    }
}

const allowedEmails = ['gmail.com', 'abv.bg', 'yandex.ru', 'yahoo.com']
function IsAllowedEmail(email) {

    if (typeof email !== 'string')
        return false

    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let domain = email.split("@")[1]

    return allowedEmails.includes(domain) && regex.test(email)

}

module.exports = new EnterController();