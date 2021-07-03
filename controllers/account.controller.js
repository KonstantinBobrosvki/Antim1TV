class AccountController {
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
}
module.exports=new AccountController()