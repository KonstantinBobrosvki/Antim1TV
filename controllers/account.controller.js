class AccountController {
    async GetPage(req, res) {
        res.render('account', {
            title: "Аккаунт",
            active: { account: true },
            css: ['account.css'],
            js: ['account.js']
        });
    }
}
module.exports = new AccountController()