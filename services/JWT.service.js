const jwt = require('jsonwebtoken')

class JwtService {
    async CreateAccessToken(user, role) {

        return new Promise((resolve, reject) => {
            let user_dto = user.get({ plain: true });
            role = role.get({ plain: true });
            delete user_dto.password;
            jwt.sign({ user_dto, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' }, function(err, token) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });

    }
}

module.exports = new JwtService();