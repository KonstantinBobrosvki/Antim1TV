/*  const usersQuery = `CREATE TABLE IF NOT EXISTS Users (
            user_id serial PRIMARY KEY,
            username VARCHAR ( 50 ) UNIQUE NOT NULL,
            password VARCHAR ( 60 ) NOT NULL,
            email VARCHAR ( 255 ) UNIQUE NOT NULL,
            verifed BOOLEAN DEFAULT false,
            created_on TIMESTAMP NOT NULL,
            last_login TIMESTAMP 
            ); `

        const rolesQuery = `CREATE TABLE IF NOT EXISTS Roles(
             role_id serial PRIMARY KEY,
             name VARCHAR (255) UNIQUE NOT NULL,
             priority INTEGER UNIQUE NOT NULL,
             deletable BOOL DEFAULT true
            ); `

        const usersrolesQuery = `CREATE TABLE IF NOT EXISTS Users_Roles (
            user_id INT NOT NULL,
            role_id INT NOT NULL,
            grant_by_id INT,
            grant_date TIMESTAMP,
            FOREIGN KEY (role_id)
            REFERENCES Roles (role_id)
            ON DELETE SET NULL,
            FOREIGN KEY (user_id)
            REFERENCES Users (user_id)
            ON DELETE CASCADE,
            FOREIGN KEY (grant_by_id)
            REFERENCES Users (user_id)
            ON DELETE SET NULL
            ); ` */


class UserDTO{
    //Gets user json from db
    constructor (user){
        this.name=user.username;  
        this.email=user.email;
        this.verifed=user.verifed;
        this.user_id=user.user_id;

        this.role_id=user.role_id;
        this.role_name=user.name;
        this.role_priority=user.priority;
    }
}

module.exports=UserDTO;