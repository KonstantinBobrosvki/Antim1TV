const jwt = require('jsonwebtoken')
const UserDTO = require('../DTOs/user.dto');
const loggerService = require('./logger.service');

class JwtService {
    async CreateAccessToken(object, expiresIn) {
        //receive shit like {user:new_user,rights,priority}
        return new Promise((resolve, reject) => {

            const user_dto = new UserDTO(object.user);
            const rights = object.rights;
            const priority = object.priority;

            loggerService.Debug({ user: {...user_dto, rights, priority } });

            jwt.sign({ user: {...user_dto, rights, priority } }, process.env.ACCESS_TOKEN_SECRET, { expiresIn }, function(err, token) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });

    }

    async ReadToken(string){
        return new Promise((resolve,reject)=>{
            jwt.verify(string, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                   reject(err)
                } else {
                   resolve(decoded)
                }
            });
        })
       
    }
}

module.exports = new JwtService();