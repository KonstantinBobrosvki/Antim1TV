const jwt = require('jsonwebtoken')
const UserDTO = require('../DTOs/user.dto')
const RoleDTO = require('../DTOs/role.dto')
class JwtService {
    async CreateAccessToken(user, role) {

        return new Promise((resolve, reject) => {

            let user_dto = new UserDTO(user);
            let role_dto = new RoleDTO(role);

            jwt.sign({ user: user_dto, role: role_dto }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' }, function(err, token) {
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