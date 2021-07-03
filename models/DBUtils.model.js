const { Pool } = require('pg')
const pool = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

class DBUtils {

    async Init() {

        const usersQuery = `CREATE TABLE IF NOT EXISTS Users (
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
            user_id INT UNIQUE NOT NULL,
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
            ); `

        const fillQuery = `
            INSERT INTO Roles (name, priority, deletable) VALUES('Участник', 2 ,false) RETURNING *;
            INSERT INTO Roles (name, priority, deletable) VALUES('Главен администратор',1000 ,false) RETURNING *;
            INSERT INTO Roles (name, priority, deletable) VALUES('Старши модератор',500 ,false) RETURNING *;
            INSERT INTO Roles (name, priority, deletable) VALUES('Модератор',300 ,false) RETURNING *;
            INSERT INTO Roles (name, priority, deletable) VALUES('Учител',100 ,false) RETURNING *;
            INSERT INTO Roles (name, priority, deletable) VALUES('Депутат', 50 ,false) RETURNING *;
            INSERT INTO Roles (name, priority, deletable) VALUES('Система',20 ,false) RETURNING *;
            INSERT INTO Users (username, password, email, created_on) VALUES('Игнатий', 'password', 'mail@gmail.com', now()) RETURNING *;
            INSERT INTO Users (username, password, email, created_on) VALUES('Надя', 'password', 'cool@gmail.com', now()) RETURNING *;
            INSERT INTO Users (username, password, email, created_on) VALUES('Валери', 'password', 'doge@gmail.com', now()) RETURNING *;
            INSERT INTO Users (username, password, email, created_on) VALUES('Володя', 'password', 'admin@gmail.com', now()) RETURNING *;
            INSERT INTO Users_Roles ( user_id,role_id ,grant_by_id, grant_date ) VALUES(1,1,4,now());
            INSERT INTO Users_Roles ( user_id,role_id ,grant_by_id, grant_date ) VALUES(2,1,4,now());
            INSERT INTO Users_Roles ( user_id,role_id ,grant_by_id, grant_date ) VALUES(3,2,4,now());
         `

        const sesions_query=`CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
              "sess" json NOT NULL,
              "expire" timestamp(6) NOT NULL
          )
          WITH (OIDS=FALSE);
          
          ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
          
          CREATE INDEX "IDX_session_expire" ON "session" ("expire");
          `

        const allqueries = usersQuery + rolesQuery + usersrolesQuery + fillQuery+sesions_query;

        return this.Query(allqueries,'');

    }

    async Clear() {
        const clearQuery=`
        DROP TABLE IF EXISTS  Users_Roles, Roles, Users, session ;
        `
        return this.Query(clearQuery,'');
    }

    async Query(text,params){

        try {
            return pool.query(text, params);

        } catch (error) {

            console.log(JSON.stringify(error));
            throw error;
        }
        

    }

    GetPool(){
        return pool;
    }

    

    
}

module.exports = new DBUtils();