const jwt = require('jsonwebtoken')
const UserDTO = require('../DTOs/user.dto')
class JwtService {
    async CreateAccessToken(user) {

        return new Promise((resolve, reject) => {

            let user_dto = new UserDTO(user);

            jwt.sign({ user: user_dto }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' }, function(err, token) {
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