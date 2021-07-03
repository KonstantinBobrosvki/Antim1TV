const DBUtils = require('./DBUtils.model');
const all_user_query=`Select * From roles ORDER BY roles.priority`
let roles = [];
HashRoles();

//hash roles
setInterval(() => {
    HashRoles()
}, 1000 * 60 * 60 * 24 * 3)

async function HashRoles() {
   
    roles = await DBUtils.Query(all_user_query);
    roles=roles.rows;
    console.log(roles)
}

class UsersDB {
    //credits must contain username or email
    async GetUser(credits) {
        let users = {}
        if (credits.username) {
            let user_query = 'SELECT users.username, users.email, users.verifed, users.user_id ,users.password FROM users Where users.username=$1 Limit 1;'
            users = await DBUtils.Query(user_query, [credits.username])
        } else if (credits.email) {
            let user_query = 'SELECT users.username, users.email, users.verifed, users.user_id ,users.password FROM users Where users.email=$1 Limit 1;'
            users = await DBUtils.Query(user_query, [credits.email])
        }

        if (users.rows == 0) {
            return null;
        }
        console.log(users.rows);
        let user = users.rows[0];

        let role_query = `SELECT users_roles.role_id From users_roles where users_roles.user_id = $1 Limit 1;`

        let role_id = await DBUtils.Query(role_query, [user.user_id]);

        if (role_id.rows == 0) {
            user = { ...roles[0], ...user };
            return user;
        }

        role_id = role_id.rows[0].role_id

        let hashed_role = null;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].role_id == role_id) {
                hashed_role = roles[i];
                break;
            }
        }

        if (hashed_role) {
            user = { ...hashed_role, ...user };
            return user;
        }

        //If role is not hashed
        HashRoles();

        hashed_role = null;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].role_id == role_id) {
                hashed_role = roles[i];
                break;
            }
        }

        if (hashed_role) {
            user = { ...hashed_role, ...user };
            return user;
        }
        else {
            user = {... roles[0], ...user };
            console.log('WTF Problem in user founding');
            return user;
            throw new Error('WTF Problem in user founding');
        }

    }

    async ContainsCredits(credits) {

        let query = `Select * from Users Where users.username=$1 OR users.email=$2 Limit 1;`
        let rows = await DBUtils.Query(query, [credits.username, credits.email]);
        return rows.rows != 0
    }

    async AddUser(credits) {

        let username = credits.username;
        let password = credits.password;
        let email = credits.email;
        //username VARCHAR(50) UNIQUE NOT NULL,
        //    password VARCHAR(50) NOT NULL,
        //        email VARCHAR(255) UNIQUE NOT NULL
        if (!(typeof username === 'string' && typeof password === 'string' && typeof email === 'string')) {
            console.log('here error');
            return false;
        }
        if (username.length > 50) {
            console.log('username.length error');
            return false;
        }
        if (password.length <= 5) {
            console.log('password.length error');
            
            return false;
        }


        let user_query = `INSERT INTO Users (username, password, email, created_on) VALUES($1, $2, $3, now()) RETURNING *;`

        try {

            let user = await DBUtils.Query(user_query, [username, password, email])

            user = user.rows[0];
            console.log("user done");
            await this.GiveRole(user, roles[0], null);
            return {...user,...roles[0]};
 

        } catch (error) {
            console.log(error);
            return false;
        }

        
    }

    async GiveRole(user, role, giver) {

        let users_roles_query = `INSERT INTO users_roles (user_id, role_id, grant_date, grant_by_id) 
        VALUES ($1, $2, now(),$3)
        ON CONFLICT(user_id) DO UPDATE 
        SET role_id = $2, grant_date = now(), grant_by_id =$3`

        let giver_id = null;

        if (giver != null && giver?.id != undefined) {
            giver_id = giver.id;
        }

        return DBUtils.Query(users_roles_query, [user.user_id, role.role_id, giver_id])
    }
}

module.exports = new UsersDB();